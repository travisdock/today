module Api
  module V1
    class MilestonesController < BaseController
      require_scope :read, only: [ :index, :show ]
      require_scope :write, only: [ :create, :update, :destroy, :toggle_complete ]

      before_action :set_project

      def index
        milestones = @project.milestones.order(:position)
        render json: { milestones: milestones.map { |m| milestone_json(m) } }
      end

      def show
        milestone = @project.milestones.find(params[:id])
        render json: { milestone: milestone_json(milestone, detailed: true) }
      end

      def create
        milestone = @project.milestones.build(milestone_params)
        if milestone.save
          render json: { milestone: milestone_json(milestone) }, status: :created
        else
          render json: { errors: milestone.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        milestone = @project.milestones.find(params[:id])
        if milestone.update(milestone_params)
          render json: { milestone: milestone_json(milestone) }
        else
          render json: { errors: milestone.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        milestone = @project.milestones.find(params[:id])
        milestone.destroy!
        head :no_content
      end

      def toggle_complete
        milestone = @project.milestones.find(params[:id])
        if milestone.completed_at.present?
          milestone.update!(completed_at: nil)
        else
          milestone.update!(completed_at: Time.current)
        end
        render json: { milestone: milestone_json(milestone) }
      end

      private

      def set_project
        @project = current_user.projects.find(params[:project_id])
      end

      def milestone_params
        params.require(:milestone).permit(:name, :description, :position)
      end

      def milestone_json(milestone, detailed: false)
        base = {
          id: milestone.id,
          name: milestone.name,
          description: milestone.description,
          position: milestone.position,
          completed_at: milestone.completed_at&.iso8601,
          project_id: milestone.project_id,
          created_at: milestone.created_at.iso8601,
          updated_at: milestone.updated_at.iso8601
        }

        if detailed
          todos = current_user.todos.where(milestone_id: milestone.id).active
          base[:todos] = todos.map do |t|
            {
              id: t.id,
              title: t.title,
              priority_window: t.priority_window,
              completed: t.completed?
            }
          end
        end

        base
      end
    end
  end
end
