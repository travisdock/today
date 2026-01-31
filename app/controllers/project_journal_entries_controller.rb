class ProjectJournalEntriesController < ApplicationController
  before_action :set_project
  before_action :set_journal_entry, only: :destroy

  def create
    @journal_entry = @project.journal_entries.build(journal_entry_params)

    respond_to do |format|
      if @journal_entry.save
        flash.now[:notice] = "Journal entry added."
        format.turbo_stream do
          fresh_form = @project.journal_entries.build
          journal_entries = @project.journal_entries.last_two.with_attached_image

          render turbo_stream: [
            turbo_stream.replace("flash", partial: "shared/flash"),
            turbo_stream.replace("journal_entry_form", partial: "projects/journal_entries/form",
                                 locals: { project: @project, journal_entry: fresh_form }),
            turbo_stream.replace("journal_entries_list", partial: "projects/journal_entries/list",
                                 locals: { journal_entries: journal_entries })
          ]
        end
        format.html { redirect_to project_path(@project), notice: "Journal entry added." }
      else
        format.turbo_stream do
          render turbo_stream: [
            turbo_stream.replace("flash", partial: "shared/flash"),
            turbo_stream.replace("journal_entry_form", partial: "projects/journal_entries/form",
                                 locals: { project: @project, journal_entry: @journal_entry })
          ], status: :unprocessable_entity
        end
        format.html { redirect_to project_path(@project), alert: "Could not add journal entry." }
      end
    end
  end

  def destroy
    @journal_entry.destroy
    flash.now[:notice] = "Journal entry deleted."

    respond_to do |format|
      format.turbo_stream do
        journal_entries = @project.journal_entries.last_two.with_attached_image
        render turbo_stream: [
          turbo_stream.replace("flash", partial: "shared/flash"),
          turbo_stream.replace("journal_entries_list", partial: "projects/journal_entries/list",
                               locals: { journal_entries: journal_entries })
        ]
      end
      format.html { redirect_to project_path(@project), notice: "Journal entry deleted." }
    end
  end

  private

  def set_project
    @project = current_user.projects.find(params[:project_id])
  end

  def set_journal_entry
    @journal_entry = @project.journal_entries.find(params[:id])
  end

  def journal_entry_params
    params.require(:journal_entry).permit(:content, :image)
  end
end
