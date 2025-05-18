import { Schema, model } from "mongoose";

const party_schema = new Schema({
  party_name: { type: String, unique: true, required: true, trim: true },
  party_obj: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  state: String,
  since: String,
  party_icon: { type: String, unique: true, required: true, trim: true },
});

export const Party = model("party", party_schema);
