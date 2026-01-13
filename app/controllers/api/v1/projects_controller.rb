module Api
  module V1
    class ProjectsController < BaseController
      require_scope :read, only: [ :index, :show ]
      require_scope :write, only: [ :create, :update, :destroy ]

      def index
        projects = current_user.projects.unarchived.ordered
        render json: { projects: projects.map { |p| project_json(p) } }
      end

      def show
        project = current_user.projects.find(params[:id])
        render json: { project: project_json(project, detailed: true) }
      end

      def create
        project = current_user.projects.build(project_params)
        if project.save
          render json: { project: project_json(project) }, status: :created
        else
          render json: { errors: project.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        project = current_user.projects.find(params[:id])
        if project.update(project_params)
          render json: { project: project_json(project) }
        else
          render json: { errors: project.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        project = current_user.projects.find(params[:id])
        project.update!(archived_at: Time.current)
        head :no_content
      end

      private

      def project_params
        params.require(:project).permit(:name, :description, :section)
      end

      def project_json(project, detailed: false)
        base = {
          id: project.id,
          name: project.name,
          description: project.description,
          section: project.section,
          thoughts_count: project.thoughts_count,
          resources_count: project.resources_count,
          journal_entries_count: project.journal_entries_count,
          created_at: project.created_at.iso8601,
          updated_at: project.updated_at.iso8601
        }

        if detailed
          base[:milestones] = project.milestones.order(:position).map { |m| milestone_json(m) }
        end

        base
      end

      def milestone_json(milestone)
        {
          id: milestone.id,
          name: milestone.name,
          description: milestone.description,
          position: milestone.position,
          completed_at: milestone.completed_at&.iso8601
        }
      end
    end
  end
end
