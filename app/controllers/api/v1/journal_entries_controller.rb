module Api
  module V1
    class JournalEntriesController < BaseController
      require_scope :read, only: [ :index, :show ]
      require_scope :write, only: [ :create, :destroy ]

      before_action :set_project

      def index
        entries = @project.journal_entries.order(created_at: :desc)
        render json: { journal_entries: entries.map { |e| entry_json(e) } }
      end

      def show
        entry = @project.journal_entries.find(params[:id])
        render json: { journal_entry: entry_json(entry) }
      end

      def create
        entry = @project.journal_entries.build(entry_params)
        if entry.save
          render json: { journal_entry: entry_json(entry) }, status: :created
        else
          render json: { errors: entry.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        entry = @project.journal_entries.find(params[:id])
        entry.destroy!
        head :no_content
      end

      private

      def set_project
        @project = current_user.projects.find(params[:project_id])
      end

      def entry_params
        params.require(:journal_entry).permit(:content)
      end

      def entry_json(entry)
        {
          id: entry.id,
          content: entry.content,
          project_id: entry.project_id,
          created_at: entry.created_at.iso8601,
          updated_at: entry.updated_at.iso8601
        }
      end
    end
  end
end
