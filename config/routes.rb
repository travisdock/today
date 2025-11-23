Rails.application.routes.draw do
  resource :session
  resources :users, only: %i[new create show]
  resources :todos, only: %i[index create destroy] do
    collection do
      patch :reorder
    end
    member do
      patch :complete
      patch :move
    end
  end
  resources :agents, only: :create

  # Streaming voice command API endpoints
  namespace :api do
    namespace :gemini do
      post "token", to: "tokens#create"
    end
    resources :todos, only: :create
  end

  root "sessions#new"
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
