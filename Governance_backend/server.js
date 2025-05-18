import express from "express";
import { Person } from "./Model/person_schema.js";
import { Party } from "./Model/party_schema.js";
import cors from "cors";
import { connect_to_mongo } from "./config/connectDb.js";

let app = express();
app.use(express.json());
app.use(cors());

const package_id =
  "0x65f6e13efce4b3bf0f533d273ec70212530ad73ca1503255c8d4900817b67302";
const citizen_object_id =
  "0x495322b61a9def1baa192b7dff1bb4ea0800de4a95752c5308987f04d7007b77";
const party_registery =
  "0x7aa95b9cfa1c4877da8d734d07d1b68d24600b9977587a68b3d38dc1b9388b1d";

let client = connect_to_mongo(
  "mongodb+srv://naruka:abcd@cluster0.q0lqt.mongodb.net/"
)
  .then((mongooseInstance) => {
    console.log("Connection name:", mongooseInstance.connection.name); // 'data'
    console.log("Host:", mongooseInstance.connection.host); // 'localhost'
    console.log("DB connected successfully 🚀");
  })
  .catch((err) => {
    console.error("Connection error:", err.message);
  });
//to get
app.get("/get/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let data = await Person.findById("6825c48a857cea35cdb51805");
    if (Object.values(data).length > 0) {
      res.status(200).json({
        success: "true",
        message: "verified user",
      });
    } else {
      res.status(404).json({
        success: "false",
        message: "user is not a citizen",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: "false",
      message: "Oooopsss....! internal server error!",
    });
  }
});
//to update
app.patch("/force_update/:aadhar_id", async (req, res) => {
  try {
    const { aadhar_id } = req?.params;
    const { updateData } = req?.body;
    if (!updateData) {
      return res.status(404).json({
        success: false,
        message: "invalid data provided",
      });
    }
    //write minting logic, for new wallet
    console.log(updateData);
    let data = await Person.findOne({
      aadhar_id,
    });
    console.log(data);
    if (Object.values(data).length > 0) {
      let updated = await Person.findByIdAndUpdate(data._id, updateData, {
        new: true,
      });
      console.log(updated);

      res.status(200).json({
        success: true,
        message: "user details updated",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "failed to update",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: "false",
      message: "Oooopsss....! internal server error!",
    });
  }
});

app.post("/add_citizen", async (req, res) => {
  try {
    let { body } = req;
    if (!body.first_name || !body.aadhaar_id || !body.wallet_address) {
      return res.status(404).json({
        success: false,
        message: "failed to add the user!",
      });
    }

    let new_user = await Person.create({ ...body });
    if (new_user) {
      res.status(200).json({
        success: true,
        message: "create user successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "either user already exist or data is wrong!",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "internal server error!",
    });
  }
});

app.delete("/remove_party/:id", async (req, res) => {
  let { id } = req.params;
  let result = await Party.findOneAndDelete({ party_obj: id });
  if (result) {
    return res
      .status(200)
      .json({ success: true, message: "party removed successfully!" });
  }
  return res.status(500).json({
    success: false,
    message: "internal server error",
  });
});

app.post("/register_party", async (req, res) => {
  try {
    let { body } = req;
    if (
      !body.party_name ||
      !body.party_obj ||
      !body.since ||
      !body.party_icon
    ) {
      console.log(body.party_name, body.party_obj, body.since, body.party_icon);
      return res
        .status(400)
        .json({ success: false, message: "please share all the fields " });
    }

    //registering party
    let save = await Party.create({
      ...body,
    });

    if (save) {
      console.log("Party created successfully:", save);
      return res.status(200).json({
        success: true,
        message: "party created successfully!",
      });
    } else {
      console.log("Failed to create Party.");
      return res.status(404).json({
        success: false,
        message: "failed to create party",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "internal server errror!",
    });
  }
});

app.get("/fetch_party_results", async (req, res) => {
  try {
    let parties = await Party.find({});
    if (!parties) {
      return res.status(404).json({
        success: false,
        message: "no registered parties",
      });
    }
    //logic to fetch from chain

    //logic end here

    res.status(200).json({
      success: true,
      message: "fetched parties successfully",
      data: parties,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "internal server errror!",
    });
  }
});

app.post("/fetch_sorted_party", async (req, res) => {
  try {
    let { query } = req.body;
    let data = await Party.find({
      party_name: { $regex: query, $options: "i" },
    });
    // console.log(data);
    return res.status(200).json({ data });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "internal server error" });
  }
});
app.delete("/remove_citizen/:id", async (req, res) => {
  let { id } = req.params;
  let result = await Person.findOneAndDelete({
    wallet_address: id,
  });

  if (result) {
    return res
      .status(200)
      .json({ success: true, message: "party removed successfully!" });
  }
  return res.status(500).json({
    success: false,
    message: "internal server error",
  });
});

app.get("/election_package_id", (_, res) => {
  return res.status(200).json({
    success: true,
    data: package_id,
  });
});

app.listen("8080", () => console.log("server is running on 8080"));
