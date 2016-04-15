class CreateRecord < ActiveRecord::Migration
  def change
    create_table :records do |t|
      t.string :email
      t.string :from
      t.string :to
      t.string :title
      t.text   :message
      t.timestamps null: false
    end
  end
end
