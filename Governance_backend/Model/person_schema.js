import { Schema, model } from "mongoose";

const personSchema = new Schema({
  first_name: {
    type: String,
    required: true, // 👈 ensures no duplicates
    trim: true, // optional: removes extra spaces
  },
  mid_name: {
    type: String,
    required: true, // 👈 ensures no duplicates
    trim: true, // optional: removes extra spaces
  },
  last_name: {
    type: String,
    required: true, // 👈 ensures no duplicates
    trim: true, // optional: removes extra spaces
  },
  aadhaar_id: {
    type: String,
    required: true,
    unique: true, // 👈 ensures no duplicates
    trim: true, // optional: removes extra spaces
  },
  state: {
    type: String,
    required: true, // 👈 ensures no duplicates
    trim: true, // optional: removes extra spaces
  },

  wallet_address: {
    type: String,
    required: true,
    unique: true, // 👈 ensures no duplicates
    trim: true, // optional: removes extra spaces
  },
});

export const Person = model("person", personSchema);
