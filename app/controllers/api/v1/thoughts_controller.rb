module Api
  module V1
    class ThoughtsController < BaseController
      require_scope :read, only: [ :index, :show ]
      require_scope :write, only: [ :create, :destroy ]

      before_action :set_project

      def index
        thoughts = @project.thoughts.order(created_at: :desc)
        render json: { thoughts: thoughts.map { |t| thought_json(t) } }
      end

      def show
        thought = @project.thoughts.find(params[:id])
        render json: { thought: thought_json(thought) }
      end

      def create
        thought = @project.thoughts.build(thought_params)
        if thought.save
          render json: { thought: thought_json(thought) }, status: :created
        else
          render json: { errors: thought.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        thought = @project.thoughts.find(params[:id])
        thought.destroy!
        head :no_content
      end

      private

      def set_project
        @project = current_user.projects.find(params[:project_id])
      end

      def thought_params
        params.require(:thought).permit(:content)
      end

      def thought_json(thought)
        {
          id: thought.id,
          content: thought.content,
          project_id: thought.project_id,
          created_at: thought.created_at.iso8601,
          updated_at: thought.updated_at.iso8601
        }
      end
    end
  end
end
