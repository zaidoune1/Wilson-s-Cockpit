import { Request, Response } from "express";
import knex from "../db";

const PlanetController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const filterName = req.query.filterName as string;

      let query = knex("planets")
        .select("planets.*", "images.path", "images.name as imageName")
        .join("images", "images.id", "=", "planets.imageId");

      if (filterName) {
        query = query.where("planets.name", "ilike", `%${filterName}%`);
      }

      const planetsData = await query;

      const planets = planetsData.map(
        ({ id, name, isHabitable, description, path, imageName }) => ({
          id,
          name,
          isHabitable,
          description,
          image: {
            path,
            name: imageName,
          },
        })
      );

      if (planets.length === 0) {
        res.status(404).json({ error: "Aucune planète trouvée" });
      } else {
        res.status(200).json(planets);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des planètes :", error);
      res.status(500).json({ error: "Erreur interne du serveur" });
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const data = await knex("planets").where("id", id).first();
      if (data) {
        res.status(200).json({
          id: data.id,
          name: data.name,
          isHabitable: data.isHabitable,
          description: data.description,
          image: {
            path: data.path,
            name: data.imageName,
          },
        });
      } else {
        res.status(404).json({ error: "Planet not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const { name, isHabitable, imageId } = req.body;
    try {
      const [id] = await knex("planets").insert({ name, isHabitable, imageId });
      res.status(201).json({
        id,
        name,
        isHabitable,
        imageId,
      });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, isHabitable, imageId } = req.body;
    try {
      const updatedRows = await knex("planets")
        .where("id", id)
        .update({ name, isHabitable, imageId });
      if (updatedRows > 0) {
        res.status(200).json({ message: "Planet updated successfully" });
      } else {
        res.status(404).json({ error: "Planet not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const deletedRows = await knex("planets").where("id", id).del();
      if (deletedRows > 0) {
        res.status(200).json({ message: "Planet deleted successfully" });
      } else {
        res.status(404).json({ error: "Planet not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

export default PlanetController;
