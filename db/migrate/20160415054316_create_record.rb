class CreateRecord < ActiveRecord::Migration
  def change
    create_table :records do |t|
      t.string :nodeid
      t.string :name
      t.string :level
      t.string :from
      t.string :to
      t.timestamps null: false
    end
  end
end
