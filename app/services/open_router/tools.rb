module OpenRouter
  class Tools
    # Tool definitions
    CREATE_TODO = {
      "type" => "function",
      "function" => {
        "name" => "create_todo",
        "description" => "Create a new todo item with a title, priority window, and optional target position (1-based).",
        "parameters" => {
          "type" => "object",
          "properties" => {
            "title" => { "type" => "string" },
            "priority_window" => {
              "type" => "string",
              "enum" => [ "today", "tomorrow", "this_week", "next_week" ],
              "description" => "The priority window for this todo. Defaults to 'today' if not specified."
            },
            "position" => { "type" => "integer", "minimum" => 1 }
          },
          "required" => [ "title" ]
        }
      }
    }

    REORDER_TODOS = {
      "type" => "function",
      "function" => {
        "name" => "reorder_todos",
        "description" => "Reorder todos within a specific priority window by providing all todo IDs for that window in the desired order.",
        "parameters" => {
          "type" => "object",
          "properties" => {
            "priority_window" => {
              "type" => "string",
              "enum" => [ "today", "tomorrow", "this_week", "next_week" ],
              "description" => "The priority window to reorder todos in"
            },
            "ordered_ids" => {
              "type" => "array",
              "items" => { "type" => "integer" },
              "minItems" => 1
            }
          },
          "required" => [ "priority_window", "ordered_ids" ]
        }
      }
    }

    BULK_CREATE_TODOS = {
      "type" => "function",
      "function" => {
        "name" => "bulk_create_todos",
        "description" => "Add several todos at once, preserving their order.",
        "parameters" => {
          "type" => "object",
          "properties" => {
            "todos" => {
              "type" => "array",
              "items" => {
                "type" => "object",
                "properties" => {
                  "title" => { "type" => "string" },
                  "priority_window" => {
                    "type" => "string",
                    "enum" => [ "today", "tomorrow", "this_week", "next_week" ],
                    "description" => "The priority window for this todo. Defaults to 'today' if not specified."
                  },
                  "position" => { "type" => "integer", "minimum" => 1 }
                },
                "required" => [ "title" ]
              },
              "minItems" => 1
            }
          },
          "required" => [ "todos" ]
        }
      }
    }

    MOVE_TODO = {
      "type" => "function",
      "function" => {
        "name" => "move_todo",
        "description" => "Move a todo to a different priority window.",
        "parameters" => {
          "type" => "object",
          "properties" => {
            "todo_id" => {
              "type" => "integer",
              "description" => "The ID of the todo to move"
            },
            "priority_window" => {
              "type" => "string",
              "enum" => [ "today", "tomorrow", "this_week", "next_week" ],
              "description" => "The target priority window to move the todo to"
            }
          },
          "required" => [ "todo_id", "priority_window" ]
        }
      }
    }

    TOOL_LIST = [ CREATE_TODO, BULK_CREATE_TODOS, REORDER_TODOS, MOVE_TODO ].freeze
  end
end
