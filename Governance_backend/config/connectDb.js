import { mongoose } from "mongoose";

export const connect_to_mongo = async (URI_string) => {
  try {
    return await mongoose.connect(URI_string);
  } catch (error) {
    console.log(error);
  }
};
