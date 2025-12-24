# Live Todo Updates During Gemini Audio Streaming - Research Report

## Executive Summary

This Rails app currently implements audio streaming to Gemini Live API via Action Cable, but todos are only created in the database without live UI updates during streaming. This report explores three approaches to push live todo updates to the frontend as they're extracted during audio streaming.

## Current Architecture Overview

### Audio Streaming Flow
```
Browser (gemini_streaming_controller.js)
    ↓ PCM audio chunks via Action Cable
GeminiStreamingChannel (Action Cable)
    ↓ Base64 PCM audio
GeminiStreamingService (Ruby WebSocket client)
    ↓ WebSocket connection
Gemini Live API
    ↓ Tool calls with extracted todos
GeminiStreamingService#handle_tool_call
    ↓ Creates Todo records in database
Todo.create! (lines 168-171 in gemini_streaming_service.rb)
```

### Key Files

| File | Purpose | Key Details |
|------|---------|-------------|
| `app/channels/gemini_streaming_channel.rb` | Action Cable channel managing client connection | - Subscribes user<br>- Creates GeminiStreamingService<br>- Has callback for todos: `@gemini_service.on_todo` (line 10-13)<br>- Currently logs but doesn't transmit |
| `app/services/gemini_streaming_service.rb` | Manages WebSocket to Gemini API | - Extracts todos via `createTodos` function<br>- Creates todos in DB (line 168-171)<br>- Calls `@on_todo_callback` (line 175)<br>- Already has callback mechanism |
| `app/javascript/controllers/gemini_streaming_controller.js` | Frontend Stimulus controller | - Manages audio recording<br>- Connects to Action Cable<br>- Has `received(data)` handler (line 52-59)<br>- Currently only handles 'complete' type |
| `app/controllers/todos_controller.rb` | CRUD operations for todos | - Uses Turbo Streams extensively<br>- Has pattern for updating priority windows<br>- Shows best practices for Turbo responses |
| `app/views/todos/_priority_window_container.html.erb` | Priority window container partial | - Has DOM ID: `{window}_list_container`<br>- Used for Turbo Stream replacements |
| `app/views/todos/_todo.html.erb` | Individual todo partial | - Used to render single todos<br>- Has DOM ID: `dom_id(todo)` |

### Turbo Rails Setup

The app uses **Turbo Rails** (Hotwire):
- Gem: `turbo-rails` (in Gemfile)
- No `turbo_stream_from` subscriptions currently used
- Action Cable already mounted: `/cable`
- TodosController extensively uses Turbo Streams for CRUD operations

## Option 1: Action Cable WebSocket with Turbo Stream Updates

### Technical Approach

Use the existing Action Cable WebSocket connection to send rendered Turbo Stream HTML directly to the frontend, leveraging the browser's native Turbo Stream handling.

### How It Works

1. **When todo is created** (in `GeminiStreamingService#handle_tool_call`):
   ```ruby
   # Line 168-175 in gemini_streaming_service.rb
   todo = @user.todos.create!(
     title: todo_data["title"],
     priority_window: todo_data["priority_window"]
   )
   created_todos << todo
   @extracted_todos << todo
   @on_todo_callback&.call(todo)  # Trigger callback
   ```

2. **In the callback** (in `GeminiStreamingChannel#subscribed`):
   ```ruby
   # Line 10-13 in gemini_streaming_channel.rb
   @gemini_service.on_todo do |todo|
     # Currently just logs - we would send Turbo Stream here
     Rails.logger.info("[GeminiStreamingChannel] Todo extracted, notifying client")
   end
   ```

3. **Send Turbo Stream via Action Cable**:
   ```ruby
   @gemini_service.on_todo do |todo|
     # Render Turbo Stream HTML
     html = ApplicationController.render(
       partial: "todos/todo",
       locals: { todo: todo, section: todo.priority_window },
       formats: [:html]
     )

     # Send via Action Cable using transmit
     transmit({
       type: "turbo_stream",
       action: "append",
       target: "#{todo.priority_window}_todo_items",
       html: html
     })
   end
   ```

4. **Frontend processes Turbo Stream**:
   ```javascript
   // In gemini_streaming_controller.js received() method
   received(data) {
     console.log('[GeminiStreaming] Received:', data)

     if (data.type === 'turbo_stream') {
       // Manually apply Turbo Stream
       Turbo.renderStreamMessage(data.html)
       // OR manually manipulate DOM
       const target = document.getElementById(data.target)
       target.insertAdjacentHTML('beforeend', data.html)
     }

     if (data.type === 'complete') {
       this.controller.updateStatus(data.message)
       this.controller.cleanup()
     }
   }
   ```

### Code Changes Required

#### 1. Update `GeminiStreamingChannel` (app/channels/gemini_streaming_channel.rb)

```ruby
def subscribed
  # ... existing code ...

  @gemini_service.on_todo do |todo|
    Rails.logger.info("[GeminiStreamingChannel] Todo extracted: #{todo.title}")
    send_todo_update(todo)
  end

  @gemini_service.connect
  stream_from "gemini_streaming_#{connection.connection_identifier}"
end

private

def send_todo_update(todo)
  # Render the todo partial
  html = ApplicationController.render(
    partial: "todos/todo",
    locals: { todo: todo, section: todo.priority_window },
    formats: [:html]
  )

  # Send Turbo Stream via Action Cable
  transmit({
    type: "turbo_stream",
    action: "append",
    target: "#{todo.priority_window}_todo_items",
    html: html
  })
end
```

#### 2. Update Frontend Controller (app/javascript/controllers/gemini_streaming_controller.js)

```javascript
received(data) {
  console.log('[GeminiStreaming] Received:', data)

  if (data.type === 'turbo_stream') {
    // Apply Turbo Stream update
    const target = document.getElementById(data.target)
    if (target) {
      const temp = document.createElement('div')
      temp.innerHTML = data.html
      target.appendChild(temp.firstElementChild)
    }
  }

  if (data.type === 'complete') {
    this.controller.updateStatus(data.message)
    this.controller.cleanup()
  }
}
```

#### 3. Update Priority Window Partial (app/views/todos/_priority_window.html.erb)

Ensure the container has the correct ID that matches what we're targeting:
```erb
<div id="<%= window %>_todo_items"
     class="space-y-2"
     <% if todos.any? %>
       data-controller="todo-sortable"
       data-todo-sortable-url-value="<%= reorder_todos_path %>"
       data-todo-sortable-handle-value=".todo-drag-handle"
     <% end %>>
  <!-- Todos will be appended here -->
</div>
```

### Pros

- **Minimal changes**: Leverages existing Action Cable connection
- **Consistent with app patterns**: Uses same Turbo Stream approach as TodosController
- **Simple implementation**: Direct transmission via `transmit()`
- **Real-time**: Todos appear immediately as extracted
- **No additional infrastructure**: Uses existing Action Cable setup
- **Server-rendered HTML**: Maintains Rails partials, no duplication

### Cons

- **Bypasses Turbo Stream tag**: Doesn't use `<turbo-stream>` tag, manual DOM manipulation
- **Limited to connected clients**: Only works for active WebSocket connection
- **No persistence**: If connection drops, updates are lost
- **Couples rendering to channel**: Channel now responsible for rendering

## Option 2: Turbo Broadcasts with Model Callbacks

### Technical Approach

Use Turbo's built-in broadcast mechanism with `turbo_stream_from` to automatically push updates when todos are created, following Rails/Hotwire conventions.

### How It Works

1. **Add broadcast to Todo model**:
   ```ruby
   # app/models/todo.rb
   class Todo < ApplicationRecord
     belongs_to :user

     # Broadcast after creation
     after_create_commit do
       broadcast_append_to(
         "user_#{user.id}_todos",
         target: "#{priority_window}_todo_items",
         partial: "todos/todo",
         locals: { todo: self, section: priority_window }
       )
     end
   end
   ```

2. **Subscribe to stream in view**:
   ```erb
   <%= turbo_stream_from "user_#{current_user.id}_todos" %>
   ```

3. **Todos automatically appear**: When `Todo.create!` is called in `GeminiStreamingService`, the broadcast callback fires and pushes update to all subscribed clients.

### Code Changes Required

#### 1. Update Todo Model (app/models/todo.rb)

```ruby
class Todo < ApplicationRecord
  belongs_to :user

  # ... existing code ...

  # Broadcast todo creation to user's stream
  after_create_commit :broadcast_todo_creation

  private

  def broadcast_todo_creation
    broadcast_append_to(
      "user_#{user.id}_todos",
      target: "#{priority_window}_todo_items",
      partial: "todos/todo",
      locals: { todo: self, section: priority_window }
    )
  end
end
```

#### 2. Add Stream Subscription to View (app/views/todos/index.html.erb)

```erb
<%# Add at top of file %>
<%= turbo_stream_from "user_#{Current.user.id}_todos" %>

<% content_for :main_class, "flex flex-1 justify-center px-4 py-5 sm:px-6 lg:px-8" %>
<!-- ... rest of existing code ... -->
```

#### 3. Optional: Conditional Broadcasting

To only broadcast during streaming (not regular todo creation):

```ruby
# app/services/gemini_streaming_service.rb
def handle_tool_call(tool_call)
  # ... existing code ...

  todos.each do |todo_data|
    todo = @user.todos.create!(
      title: todo_data["title"],
      priority_window: todo_data["priority_window"]
    )
  end
end

# app/models/todo.rb
attr_accessor :skip_broadcast

def broadcast_todo_creation
  # Only broadcast if not explicitly skipped
  return if skip_broadcast

  broadcast_append_to(
    "user_#{user.id}_todos",
    target: "#{priority_window}_todo_items",
    partial: "todos/todo",
    locals: { todo: self, section: priority_window }
  )
end
```

### Pros

- **Rails/Hotwire convention**: Follows official Turbo Rails patterns
- **Automatic**: No manual transmission code needed
- **Persistent**: Works even if Action Cable connection is different from broadcast
- **Clean separation**: Model handles broadcasting, channel handles audio
- **Multiple clients**: If user has multiple tabs open, all update
- **Standardized**: Uses Turbo Stream tags properly

### Cons

- **Always broadcasts**: Every todo creation triggers broadcast (unless conditional)
- **Additional subscription**: Requires `turbo_stream_from` tag in view
- **Less control**: Can't customize per-stream behavior easily
- **Overhead**: Uses Action Cable for broadcasts even though already connected
- **May conflict**: If using for regular todos, need to differentiate streaming vs manual

## Option 3: Hybrid Approach - Direct Transmission with Turbo Stream HTML

### Technical Approach

Send properly formatted Turbo Stream HTML (with `<turbo-stream>` tags) via Action Cable, allowing the frontend to use native Turbo Stream processing.

### How It Works

1. **Render full Turbo Stream HTML** in channel:
   ```ruby
   html = ApplicationController.render(
     partial: "todos/streaming_update",
     formats: [:turbo_stream],
     locals: { todo: todo }
   )
   ```

2. **Send as raw HTML** via Action Cable:
   ```ruby
   transmit({
     type: "turbo_stream_html",
     html: html
   })
   ```

3. **Frontend uses Turbo.renderStreamMessage**:
   ```javascript
   if (data.type === 'turbo_stream_html') {
     Turbo.renderStreamMessage(data.html)
   }
   ```

### Code Changes Required

#### 1. Update GeminiStreamingChannel

```ruby
class GeminiStreamingChannel < ApplicationCable::Channel
  def subscribed
    Rails.logger.info("[GeminiStreamingChannel] Client subscribed")

    @gemini_service = GeminiStreamingService.new(user: current_user)
    @gemini_service.on_todo do |todo|
      Rails.logger.info("[GeminiStreamingChannel] Todo extracted: #{todo.title}")
      send_turbo_stream_update(todo)
    end
    @gemini_service.connect

    stream_from "gemini_streaming_#{connection.connection_identifier}"
  end

  # ... existing methods ...

  private

  def send_turbo_stream_update(todo)
    html = ApplicationController.render(
      partial: "todos/streaming_update",
      formats: [:turbo_stream],
      locals: { todo: todo }
    )

    transmit({
      type: "turbo_stream_html",
      html: html
    })
  end
end
```

#### 2. Create Turbo Stream Partial (app/views/todos/_streaming_update.turbo_stream.erb)

```erb
<%# Append the new todo %>
<%= turbo_stream.append "#{todo.priority_window}_todo_items" do %>
  <%= render "todos/todo", todo: todo, section: todo.priority_window %>
<% end %>

<%# Update the count %>
<%= turbo_stream.replace "#{todo.priority_window}_count" do %>
  <span class="ml-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
    <%= todo.user.todos.active.where(priority_window: todo.priority_window).count %>
  </span>
<% end %>
```

#### 3. Update Frontend Controller

```javascript
// app/javascript/controllers/gemini_streaming_controller.js

received(data) {
  console.log('[GeminiStreaming] Received:', data)

  // Handle Turbo Stream updates
  if (data.type === 'turbo_stream_html') {
    Turbo.renderStreamMessage(data.html)
  }

  // Handle completion
  if (data.type === 'complete') {
    this.controller.updateStatus(data.message)
    this.controller.cleanup()
  }
}
```

#### 4. Update Priority Window Partial

```erb
<%# app/views/todos/_priority_window.html.erb %>

<div class="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-xl backdrop-blur">
  <%# Window Header %>
  <div class="mb-4 flex items-center justify-between">
    <h2 class="text-xl font-semibold text-slate-900">
      <%= window.to_s.titleize %>
      <span id="<%= window %>_count" class="ml-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
        <%= todos.count %>
      </span>
    </h2>
  </div>

  <%# Sortable Todo List %>
  <div id="<%= window %>_todo_items"
       class="space-y-2"
       <% if todos.any? %>
         data-controller="todo-sortable"
         data-todo-sortable-url-value="<%= reorder_todos_path %>"
         data-todo-sortable-handle-value=".todo-drag-handle"
       <% end %>>
    <% if todos.any? %>
      <%= render partial: "todos/todo", collection: todos, locals: { section: window } %>
    <% else %>
      <div class="py-8 text-center text-slate-400">
        <p>No todos in this window</p>
      </div>
    <% end %>
  </div>
</div>
```

### Pros

- **Uses Turbo properly**: Leverages `<turbo-stream>` tags and `Turbo.renderStreamMessage()`
- **Multiple actions**: Can append todo AND update count in single transmission
- **Flexible**: Can send any Turbo Stream action (append, prepend, replace, update, remove)
- **Existing connection**: Uses Action Cable already connected for audio
- **Server-rendered**: Maintains Rails view consistency
- **Best of both worlds**: Combines Option 1's directness with Option 2's conventions

### Cons

- **Slightly more complex**: Requires Turbo Stream partial
- **Manual transmission**: Not automatic like model callbacks
- **Couples view to channel**: Channel needs to know about rendering

## Comparison Matrix

| Feature | Option 1: Direct Transmission | Option 2: Turbo Broadcasts | Option 3: Hybrid |
|---------|------------------------------|----------------------------|------------------|
| **Implementation Complexity** | Low | Low | Medium |
| **Uses Turbo Properly** | No | Yes | Yes |
| **Leverages Existing WebSocket** | Yes | No (separate broadcast) | Yes |
| **Automatic** | No | Yes | No |
| **Multiple Actions per Update** | Limited | Limited | Yes |
| **Code Changes** | Minimal | Minimal | Moderate |
| **Follows Rails Conventions** | No | Yes | Yes |
| **Performance** | Best | Good | Best |
| **Flexibility** | Medium | Low | High |

## Recommendation

### Primary Recommendation: Option 3 (Hybrid Approach)

**Rationale:**
1. **Best alignment with existing architecture**: The app already uses Turbo Streams extensively (see TodosController)
2. **Leverages existing WebSocket**: No additional Action Cable subscription needed
3. **Proper Turbo Stream handling**: Uses `<turbo-stream>` tags and native `Turbo.renderStreamMessage()`
4. **Multiple UI updates**: Can update both todo list AND count in one transmission
5. **Consistent with app patterns**: Similar to how TodosController returns Turbo Streams

**When to use:**
- Primary implementation for the streaming feature
- When you want immediate updates during audio streaming
- When consistency with existing TodosController patterns matters

### Alternative: Option 2 (Turbo Broadcasts)

**When to use:**
- If you want todos to appear in ALL open tabs/windows
- If you prefer zero-code approach (model callbacks handle everything)
- If you want to standardize all todo creation updates
- If you plan to expand real-time features beyond streaming

**Additional consideration:**
Could be combined with Option 3 - use broadcasts for regular todo creation, and direct Turbo Stream transmission during streaming.

### Not Recommended: Option 1

While simplest, it bypasses Turbo's conventions and requires manual DOM manipulation, which goes against the Hotwire philosophy the app is built on.

## Implementation Checklist

For **Option 3 (Recommended)**:

- [ ] Create Turbo Stream partial: `app/views/todos/_streaming_update.turbo_stream.erb`
- [ ] Update `GeminiStreamingChannel#subscribed` to add todo callback
- [ ] Add `send_turbo_stream_update` private method to channel
- [ ] Update `gemini_streaming_controller.js` received() handler
- [ ] Add count span ID to priority window header
- [ ] Test with multiple todos during one recording
- [ ] Verify counts update correctly
- [ ] Test with empty priority windows
- [ ] Verify sortable initialization works with dynamically added todos

## Additional Considerations

### Sortable Functionality

The app uses SortableJS for drag-and-drop reordering. When todos are dynamically added:

**Potential Issue**: New todos might not be sortable immediately

**Solution**: The sortable controller should automatically detect new items, but verify by testing. If needed, refresh the sortable instance:

```javascript
// May need to refresh sortable instance if todos are added while recording
// In gemini_streaming_controller.js:
received(data) {
  if (data.type === 'turbo_stream_html') {
    Turbo.renderStreamMessage(data.html)
    // Trigger sortable refresh if needed
    this.refreshSortable()
  }
}

refreshSortable() {
  // Dispatch custom event to sortable controllers
  document.querySelectorAll('[data-controller~="todo-sortable"]').forEach(el => {
    el.dispatchEvent(new CustomEvent('turbo:load'))
  })
}
```

### Empty State Handling

When first todo is added to empty window, need to:
1. Remove empty state message
2. Add sortable data attributes

**Solution**: Use conditional logic in the Turbo Stream partial:

```erb
<%# In _streaming_update.turbo_stream.erb %>

<% if todo.user.todos.active.where(priority_window: todo.priority_window).count == 1 %>
  <%# First todo in this window - replace entire container %>
  <%= turbo_stream.replace "#{todo.priority_window}_todo_items" do %>
    <div id="<%= todo.priority_window %>_todo_items"
         class="space-y-2"
         data-controller="todo-sortable"
         data-todo-sortable-url-value="<%= reorder_todos_path %>"
         data-todo-sortable-handle-value=".todo-drag-handle">
      <%= render "todos/todo", todo: todo, section: todo.priority_window %>
    </div>
  <% end %>
<% else %>
  <%# Append to existing list %>
  <%= turbo_stream.append "#{todo.priority_window}_todo_items" do %>
    <%= render "todos/todo", todo: todo, section: todo.priority_window %>
  <% end %>
<% end %>
```

### Performance Considerations

- **Database queries**: Each Turbo Stream update runs query for count - consider caching or counter caches
- **Rendering overhead**: Each todo renders partial - acceptable for real-time streaming use case
- **Action Cable capacity**: Each transmission is small (~2-5KB), should handle easily
- **Multiple todos**: If user mentions 5 todos in one sentence, will send 5 separate transmissions

### Error Handling

Add error handling for transmission failures:

```ruby
def send_turbo_stream_update(todo)
  html = ApplicationController.render(
    partial: "todos/streaming_update",
    formats: [:turbo_stream],
    locals: { todo: todo }
  )

  transmit({
    type: "turbo_stream_html",
    html: html
  })
rescue => e
  Rails.logger.error("[GeminiStreamingChannel] Failed to send update: #{e.message}")
  # Continue processing other todos
end
```

## Testing Strategy

### Manual Testing Steps

1. Start Rails server and open todos page
2. Click streaming button and grant mic permission
3. Say: "Buy groceries today" - **verify todo appears immediately**
4. Say: "Call dentist tomorrow" - **verify second todo appears in different window**
5. Say: "Walk dog and feed cat today" - **verify both appear in today**
6. Click stop - **verify completion message**
7. Check database to confirm todos were created
8. Verify todo counts updated correctly
9. Test drag-and-drop still works on new todos
10. Refresh page and verify todos persist

### Edge Cases to Test

- Empty priority window receiving first todo
- Multiple todos to same window in quick succession
- Very long todo title (test rendering)
- Special characters in todo title
- Network interruption during streaming
- Clicking stop before any todos extracted

## Conclusion

The **Hybrid Approach (Option 3)** provides the best balance of:
- Following Rails/Hotwire conventions (Turbo Streams)
- Leveraging existing WebSocket connection
- Enabling multiple UI updates per todo
- Maintaining consistency with existing TodosController patterns
- Providing flexibility for future enhancements

The implementation requires moderate code changes but results in a robust, maintainable solution that aligns with the app's architecture and provides an excellent user experience with immediate visual feedback during audio streaming.
