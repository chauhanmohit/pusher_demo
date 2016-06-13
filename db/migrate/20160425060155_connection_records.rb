class ConnectionRecords < ActiveRecord::Migration
  def change
    create_table :connections do |t|
      t.string :from
      t.string :to
      t.timestamps null: false
    end
  end
end
