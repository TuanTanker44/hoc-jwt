import { use } from "react";
import { User } from "../models/User.js";

const userController = {
  getAllUser: async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  getUserById: async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json("User not found!");
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json("Error fetching user!");
    }
  },

  deleteUser: async (req, res) => {
    try {
      //  /:id
      const user = await User.findById(req.params.id);
      res.status(200).json("Delete successfully!");
    } catch (error) {
      res.status(500).json(error);
    }
  },
};

export default userController;
