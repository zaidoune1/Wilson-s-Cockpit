import { Request, Response } from "express";
import knex from "../db";

const AstronautController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const astronautData = await knex("astronauts")
        .join("planets", "astronauts.originPlanetId", "=", "planets.id")
        .leftJoin("images", "planets.imageId", "=", "images.id")
        .select(
          "astronauts.id",
          "astronauts.firstname",
          "astronauts.lastname",
          "planets.name as planetName",
          "planets.description as planetDescription",
          "planets.isHabitable",
          "images.path as imagePath",
          "images.name as imageName"
        );

      console.log("Retrieved astronaut data:", astronautData);

      const astronauts = astronautData.map((astronaut: any): any => ({
        id: astronaut.id,
        firstname: astronaut.firstname,
        lastname: astronaut.lastname,
        originPlanet: {
          name: astronaut.planetName,
          description: astronaut.planetDescription,
          isHabitable: astronaut.isHabitable,
          image: {
            path: astronaut.imagePath,
            name: astronaut.imageName,
          },
        },
      }));

      res.status(200).json(astronauts);
    } catch (error) {
      console.error("Error fetching astronauts:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const data = await knex("astronauts")
        .select(
          "astronauts.*",
          "planets.*",
          "images.path",
          "images.name as imageName"
        )
        .where("astronauts.id", id)
        .first();
      if (data) {
        res.status(200).json({
          id: data.id,
          firstname: data.firstname,
          lastname: data.lastname,
          originPlanet: {
            name: data.name,
            isHabitable: data.isHabitable,
            description: data.description,
            image: {
              path: data.path,
              name: data.imageName,
            },
          },
        });
      } else {
        res.status(404).json({ error: "Astronaut not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const { firstname, lastname, originPlanetId } = req.body;
    try {
      const [id] = await knex
        .insert({ firstname, lastname, originPlanetId })
        .into("astronauts");
      res.status(201).json({
        id,
        firstname,
        lastname,
        originPlanetId,
      });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  update: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { firstname, lastname, originPlanetId } = req.body;
    try {
      const updatedRows = await knex("astronauts")
        .where("id", id)
        .update({ firstname, lastname, originPlanetId });
      if (updatedRows > 0) {
        const updatedAstronaut = await knex("astronauts")
          .where("id", id)
          .first();
        res.status(200).json({
          message: "Astronaut updated successfully",
          astronaut: updatedAstronaut,
        });
      } else {
        res.status(404).json({ error: "Astronaut not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const deletedRows = await knex("astronauts").where("id", id).del();
      if (deletedRows > 0) {
        res.status(200).json({ message: "Astronaut deleted successfully" });
      } else {
        res.status(404).json({ error: "Astronaut not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

export default AstronautController;
