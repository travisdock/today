module Api
  module V1
    class TodosController < BaseController
      require_scope :read, only: [ :index, :show ]
      require_scope :write, only: [ :create, :update, :destroy, :complete, :move ]

      def index
        todos = current_user.todos.active
        render json: { todos: todos.map { |t| todo_json(t) } }
      end

      def show
        todo = current_user.todos.find(params[:id])
        render json: { todo: todo_json(todo) }
      end

      def create
        todo = current_user.todos.build(todo_params)
        if todo.save
          render json: { todo: todo_json(todo) }, status: :created
        else
          render json: { errors: todo.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        todo = current_user.todos.find(params[:id])
        if todo.update(todo_params)
          render json: { todo: todo_json(todo) }
        else
          render json: { errors: todo.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        todo = current_user.todos.find(params[:id])
        todo.destroy!
        head :no_content
      end

      def complete
        todo = current_user.todos.find(params[:id])
        if todo.completed?
          todo.update!(completed_at: nil)
        else
          todo.update!(completed_at: Time.current)
        end
        render json: { todo: todo_json(todo) }
      end

      def move
        todo = current_user.todos.find(params[:id])
        if todo.update(move_params)
          render json: { todo: todo_json(todo) }
        else
          render json: { errors: todo.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def todo_params
        params.require(:todo).permit(:title, :priority_window, :milestone_id)
      end

      def move_params
        params.require(:todo).permit(:priority_window, :position)
      end

      def todo_json(todo)
        {
          id: todo.id,
          title: todo.title,
          priority_window: todo.priority_window,
          position: todo.position,
          completed: todo.completed?,
          completed_at: todo.completed_at&.iso8601,
          milestone_id: todo.milestone_id,
          created_at: todo.created_at.iso8601,
          updated_at: todo.updated_at.iso8601
        }
      end
    end
  end
end
