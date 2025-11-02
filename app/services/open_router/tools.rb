module OpenRouter
  class Tools
    # Tool definitions
    CREATE_TODO = {
      "type" => "function",
      "function" => {
        "name" => "create_todo",
        "description" => "Create a new todo item with a title and optional target position (1-based).",
        "parameters" => {
          "type" => "object",
          "properties" => {
            "title" => { "type" => "string" },
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
        "description" => "Reorder todos by providing all todo IDs in the desired order.",
        "parameters" => {
          "type" => "object",
          "properties" => {
            "ordered_ids" => {
              "type" => "array",
              "items" => { "type" => "integer" },
              "minItems" => 1
            }
          },
          "required" => [ "ordered_ids" ]
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

    TOOL_LIST = [ CREATE_TODO, BULK_CREATE_TODOS, REORDER_TODOS ].freeze
  end
end
