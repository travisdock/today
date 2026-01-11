module Api
  module V1
    class DocsController < ActionController::API
      def show
        docs_path = Rails.root.join("docs", "API.md")

        if File.exist?(docs_path)
          render plain: File.read(docs_path), content_type: "text/markdown"
        else
          render plain: "Documentation not found", status: :not_found
        end
      end
    end
  end
end
