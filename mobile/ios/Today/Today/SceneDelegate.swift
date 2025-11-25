import UIKit
import Turbo
import WebKit
import AVFoundation

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    private var audioRecorder: AVAudioRecorder?
    private var audioURL: URL?
    private var streamingRecorder: StreamingAudioRecorder?
    var window: UIWindow?
    private lazy var navigationController = UINavigationController()

    // Automatically switches between development and production URLs
    // Debug builds (simulator/local testing): http://localhost:3000
    // Release builds (TestFlight/App Store): https://today.travserve.net
    private let baseURL: URL = {
        #if DEBUG
        return URL(string: "http://localhost:3000")!
        #else
        return URL(string: "https://today.travserve.net")!
        #endif
    }()

    private lazy var session: Session = {
        let configuration = WKWebViewConfiguration()
        configuration.applicationNameForUserAgent = "TurboNative-iOS"

        // Inject Turbo Native flag at document start
        let script = WKUserScript(
            source: "window.turboNativeAvailable = true;",
            injectionTime: .atDocumentStart,
            forMainFrameOnly: false
        )
        configuration.userContentController.addUserScript(script)

        let session = Session(webViewConfiguration: configuration)
        session.delegate = self
        session.pathConfiguration = pathConfiguration

        return session
    }()

    private lazy var pathConfiguration = PathConfiguration(sources: [
        .file(Bundle.main.url(forResource: "path-configuration", withExtension: "json")!)
    ])

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = (scene as? UIWindowScene) else { return }

        // Hide the navigation bar since the web UI has its own navigation
        navigationController.setNavigationBarHidden(true, animated: false)

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = navigationController
        window?.makeKeyAndVisible()

        visit(url: baseURL)
    }

    private func visit(url: URL) {
        let viewController = ViewController(url: url)
        navigationController.pushViewController(viewController, animated: true)
        session.visit(viewController)
    }
}

extension SceneDelegate: SessionDelegate {
    func session(_ session: Session, didProposeVisit proposal: VisitProposal) {
        visit(url: proposal.url)
    }

    func session(_ session: Session, didFailRequestForVisitable visitable: Visitable, error: Error) {
        print("Error: \(error)")

        let alert = UIAlertController(title: "Error", message: error.localizedDescription, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
        navigationController.present(alert, animated: true)
    }

    func sessionWebViewProcessDidTerminate(_ session: Session) {
        session.reload()
    }

    func sessionDidLoadWebView(_ session: Session) {
        // Don't auto-adjust insets - we handle safe areas in CSS
        session.webView.scrollView.contentInsetAdjustmentBehavior = .never

        // Set scroll view delegate to control bounce behavior
        session.webView.scrollView.delegate = self

        // Set background color to match the gradient's top color
        session.webView.backgroundColor = UIColor(red: 0.302, green: 0.545, blue: 1.0, alpha: 1.0) // #4d8bff
        session.webView.isOpaque = false

        // Setup audio bridge JavaScript handlers
        let contentController = session.webView.configuration.userContentController
        contentController.add(self, name: "startRecording")
        contentController.add(self, name: "stopRecording")
        contentController.add(self, name: "startStreamingRecording")
        contentController.add(self, name: "stopStreamingRecording")
        contentController.add(self, name: "isTurboNative")

        // Set UI delegate to handle JavaScript dialogs (confirm, alert)
        session.webView.uiDelegate = self

        // Inject Turbo Native detection flag
        let script = "window.turboNativeAvailable = true;"
        session.webView.evaluateJavaScript(script, completionHandler: nil)
    }
}

// MARK: - WKScriptMessageHandler
extension SceneDelegate: WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        switch message.name {
        case "isTurboNative":
            // Respond with true to indicate Turbo Native is available
            let script = "window.turboNativeAvailable = true;"
            session.webView.evaluateJavaScript(script, completionHandler: nil)

        case "startRecording":
            startRecording { success in
                // Use proper JSON encoding to prevent injection
                let payload: [String: Any] = ["success": success]
                if let jsonData = try? JSONSerialization.data(withJSONObject: payload),
                   let jsonString = String(data: jsonData, encoding: .utf8) {
                    let script = "window.dispatchEvent(new CustomEvent('turboNative:recordingStarted', { detail: \(jsonString) }));"
                    self.session.webView.evaluateJavaScript(script, completionHandler: nil)
                }
            }

        case "stopRecording":
            stopRecording { result in
                if let result = result {
                    // Use proper JSON encoding to prevent JavaScript injection
                    // Parse the pipe-delimited result (will be replaced with JSON in future)
                    let components = result.split(separator: "|", maxSplits: 1)
                    guard components.count == 2 else {
                        let script = "window.dispatchEvent(new CustomEvent('turboNative:recordingError', { detail: { message: 'Invalid audio data format' } }));"
                        self.session.webView.evaluateJavaScript(script, completionHandler: nil)
                        return
                    }

                    let base64Data = String(components[0])
                    let filename = String(components[1])

                    let payload: [String: Any] = [
                        "audioData": "\(base64Data)|\(filename)"
                    ]

                    if let jsonData = try? JSONSerialization.data(withJSONObject: payload),
                       let jsonString = String(data: jsonData, encoding: .utf8) {
                        let script = """
                        window.dispatchEvent(new CustomEvent('turboNative:recordingStopped', {
                            detail: \(jsonString)
                        }));
                        """
                        self.session.webView.evaluateJavaScript(script, completionHandler: nil)
                    } else {
                        let script = "window.dispatchEvent(new CustomEvent('turboNative:recordingError', { detail: { message: 'Failed to encode audio data' } }));"
                        self.session.webView.evaluateJavaScript(script, completionHandler: nil)
                    }
                } else {
                    let payload: [String: Any] = ["message": "Recording failed"]
                    if let jsonData = try? JSONSerialization.data(withJSONObject: payload),
                       let jsonString = String(data: jsonData, encoding: .utf8) {
                        let script = "window.dispatchEvent(new CustomEvent('turboNative:recordingError', { detail: \(jsonString) }));"
                        self.session.webView.evaluateJavaScript(script, completionHandler: nil)
                    }
                }
            }

        case "startStreamingRecording":
            // Initialize streaming recorder if needed
            if streamingRecorder == nil {
                streamingRecorder = StreamingAudioRecorder(webView: session.webView)
            }

            streamingRecorder?.startStreaming { success in
                let payload: [String: Any] = ["success": success]
                if let jsonData = try? JSONSerialization.data(withJSONObject: payload),
                   let jsonString = String(data: jsonData, encoding: .utf8) {
                    let script = "window.dispatchEvent(new CustomEvent('turboNative:streamingStarted', { detail: \(jsonString) }));"
                    self.session.webView.evaluateJavaScript(script, completionHandler: nil)
                }
            }

        case "stopStreamingRecording":
            streamingRecorder?.stopStreaming()
            let payload: [String: Any] = ["success": true]
            if let jsonData = try? JSONSerialization.data(withJSONObject: payload),
               let jsonString = String(data: jsonData, encoding: .utf8) {
                let script = "window.dispatchEvent(new CustomEvent('turboNative:streamingStopped', { detail: \(jsonString) }));"
                self.session.webView.evaluateJavaScript(script, completionHandler: nil)
            }

        default:
            break
        }
    }

    // MARK: - Audio Recording Methods
    private func startRecording(completionHandler: @escaping (Bool) -> Void) {
        // Request microphone permission
        AVAudioSession.sharedInstance().requestRecordPermission { [weak self] allowed in
            guard allowed else {
                DispatchQueue.main.async {
                    completionHandler(false)
                }
                return
            }

            DispatchQueue.main.async {
                self?.setupAndStartRecording()
                completionHandler(true)
            }
        }
    }

    private func setupAndStartRecording() {
        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.record, mode: .default)
            try audioSession.setActive(true)

            // Create temporary audio file
            let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            audioURL = documentsPath.appendingPathComponent("recording-\(UUID().uuidString).m4a")

            let settings: [String: Any] = [
                AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
                AVSampleRateKey: 44100,
                AVNumberOfChannelsKey: 1,
                AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
            ]

            guard let url = audioURL else {
                print("Error: Failed to create audio file URL")
                return
            }

            audioRecorder = try AVAudioRecorder(url: url, settings: settings)
            audioRecorder?.record()

        } catch {
            print("Error setting up audio recording: \(error.localizedDescription)")
            // Notify JavaScript layer of failure
            let payload: [String: Any] = ["message": "Failed to set up recording: \(error.localizedDescription)"]
            if let jsonData = try? JSONSerialization.data(withJSONObject: payload),
               let jsonString = String(data: jsonData, encoding: .utf8) {
                DispatchQueue.main.async {
                    let script = "window.dispatchEvent(new CustomEvent('turboNative:recordingError', { detail: \(jsonString) }));"
                    self.session.webView.evaluateJavaScript(script, completionHandler: nil)
                }
            }
        }
    }

    private func stopRecording(completionHandler: @escaping (String?) -> Void) {
        audioRecorder?.stop()
        audioRecorder = nil

        guard let audioURL = audioURL else {
            completionHandler(nil)
            return
        }

        // Convert audio file to base64
        do {
            let audioData = try Data(contentsOf: audioURL)
            let base64String = audioData.base64EncodedString()

            // Return the base64 data and filename
            let result = "\(base64String)|\(audioURL.lastPathComponent)"
            completionHandler(result)

            // Clean up
            try? FileManager.default.removeItem(at: audioURL)
        } catch {
            completionHandler(nil)
        }
    }
}

// MARK: - Streaming Audio Recorder
class StreamingAudioRecorder: NSObject {
    private var audioEngine: AVAudioEngine?
    private var inputNode: AVAudioInputNode?
    private weak var webView: WKWebView?
    private var isRecording = false

    init(webView: WKWebView) {
        self.webView = webView
        super.init()
    }

    func startStreaming(completionHandler: @escaping (Bool) -> Void) {
        // Request microphone permission
        AVAudioSession.sharedInstance().requestRecordPermission { [weak self] allowed in
            guard allowed else {
                DispatchQueue.main.async {
                    completionHandler(false)
                }
                return
            }

            DispatchQueue.main.async {
                self?.setupAndStartStreaming()
                completionHandler(true)
            }
        }
    }

    private func setupAndStartStreaming() {
        let audioSession = AVAudioSession.sharedInstance()

        do {
            try audioSession.setCategory(.record, mode: .default)
            try audioSession.setActive(true)

            audioEngine = AVAudioEngine()
            inputNode = audioEngine?.inputNode

            guard let inputNode = inputNode else {
                sendError("Failed to access audio input")
                return
            }

            // Get input format (hardware format, typically 48kHz)
            let inputFormat = inputNode.outputFormat(forBus: 0)

            // Create target format: 16kHz mono PCM16 (Gemini requirement)
            guard let targetFormat = AVAudioFormat(
                commonFormat: .pcmFormatInt16,
                sampleRate: 16000,
                channels: 1,
                interleaved: true
            ) else {
                sendError("Failed to create target audio format")
                return
            }

            // Create converter to resample from hardware format to 16kHz
            guard let converter = AVAudioConverter(from: inputFormat, to: targetFormat) else {
                sendError("Failed to create audio converter")
                return
            }

            // Install tap on input node
            inputNode.installTap(onBus: 0, bufferSize: 2048, format: inputFormat) { [weak self] buffer, _ in
                self?.processAudioBuffer(buffer, converter: converter, targetFormat: targetFormat)
            }

            try audioEngine?.start()
            isRecording = true

        } catch {
            sendError("Failed to start audio engine: \(error.localizedDescription)")
        }
    }

    private func processAudioBuffer(_ buffer: AVAudioPCMBuffer, converter: AVAudioConverter, targetFormat: AVAudioFormat) {
        guard isRecording else { return }

        // Calculate output buffer capacity
        let ratio = targetFormat.sampleRate / buffer.format.sampleRate
        let outputFrameCapacity = AVAudioFrameCount(Double(buffer.frameLength) * ratio)

        guard let outputBuffer = AVAudioPCMBuffer(
            pcmFormat: targetFormat,
            frameCapacity: outputFrameCapacity
        ) else {
            return
        }

        var error: NSError?
        let inputBlock: AVAudioConverterInputBlock = { _, outStatus in
            outStatus.pointee = .haveData
            return buffer
        }

        converter.convert(to: outputBuffer, error: &error, withInputFrom: inputBlock)

        guard error == nil else {
            return
        }

        // Get PCM16 data
        guard let channelData = outputBuffer.int16ChannelData else {
            return
        }

        let frameLength = Int(outputBuffer.frameLength)
        let data = Data(bytes: channelData[0], count: frameLength * 2)
        let base64 = data.base64EncodedString()

        // Send to JavaScript
        sendAudioChunk(base64)
    }

    private func sendAudioChunk(_ base64Audio: String) {
        let payload: [String: Any] = ["audio": base64Audio]

        guard let jsonData = try? JSONSerialization.data(withJSONObject: payload),
              let jsonString = String(data: jsonData, encoding: .utf8) else {
            return
        }

        let script = """
        window.dispatchEvent(new CustomEvent('turboNative:audioChunk', {
            detail: \(jsonString)
        }));
        """

        DispatchQueue.main.async { [weak self] in
            self?.webView?.evaluateJavaScript(script, completionHandler: nil)
        }
    }

    private func sendError(_ message: String) {
        let payload: [String: Any] = ["message": message]

        guard let jsonData = try? JSONSerialization.data(withJSONObject: payload),
              let jsonString = String(data: jsonData, encoding: .utf8) else {
            return
        }

        let script = """
        window.dispatchEvent(new CustomEvent('turboNative:streamingError', {
            detail: \(jsonString)
        }));
        """

        DispatchQueue.main.async { [weak self] in
            self?.webView?.evaluateJavaScript(script, completionHandler: nil)
        }
    }

    func stopStreaming() {
        isRecording = false
        inputNode?.removeTap(onBus: 0)
        audioEngine?.stop()

        let audioSession = AVAudioSession.sharedInstance()
        try? audioSession.setActive(false)

        audioEngine = nil
        inputNode = nil
    }
}

// MARK: - WKUIDelegate
extension SceneDelegate: WKUIDelegate {
    // Handle JavaScript confirm() dialogs
    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)

        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel) { _ in
            completionHandler(false)
        })

        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
            completionHandler(true)
        })

        navigationController.present(alert, animated: true)
    }

    // Handle JavaScript alert() dialogs
    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)

        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
            completionHandler()
        })

        navigationController.present(alert, animated: true)
    }
}

// MARK: - UIScrollViewDelegate
extension SceneDelegate: UIScrollViewDelegate {
    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        // Prevent scrolling beyond the bottom (disable bottom bounce)
        let maxOffset = max(0, scrollView.contentSize.height - scrollView.bounds.height)
        if scrollView.contentOffset.y > maxOffset {
            scrollView.contentOffset.y = maxOffset
        }
    }
}
