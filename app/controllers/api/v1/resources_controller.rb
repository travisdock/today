module Api
  module V1
    class ResourcesController < BaseController
      require_scope :read, only: [ :index, :show ]
      require_scope :write, only: [ :create, :destroy ]

      before_action :set_project

      def index
        resources = @project.resources.order(created_at: :desc)
        render json: { resources: resources.map { |r| resource_json(r) } }
      end

      def show
        resource = @project.resources.find(params[:id])
        render json: { resource: resource_json(resource) }
      end

      def create
        resource = @project.resources.build(resource_params)
        if resource.save
          render json: { resource: resource_json(resource) }, status: :created
        else
          render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        resource = @project.resources.find(params[:id])
        resource.destroy!
        head :no_content
      end

      private

      def set_project
        @project = current_user.projects.find(params[:project_id])
      end

      def resource_params
        params.require(:resource).permit(:url, :content)
      end

      def resource_json(resource)
        {
          id: resource.id,
          url: resource.url,
          content: resource.content,
          project_id: resource.project_id,
          created_at: resource.created_at.iso8601,
          updated_at: resource.updated_at.iso8601
        }
      end
    end
  end
end
