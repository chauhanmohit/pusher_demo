class CreateRecord < ActiveRecord::Migration
  def change
    create_table :nodes do |t|
      t.string :nodeid
      t.string :name
      t.string :level
      t.timestamps null: false
    end
  end
end
