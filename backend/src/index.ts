import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

/**
 * GET ALL LOGS
 */
app.get("/logs", async (req, res) => {
  try {
    const logs = await prisma.workLog.findMany({
      orderBy: {
        date: "desc",
      },
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch logs",
    });
  }
});

/**
 * CREATE LOG
 */
app.post("/logs", async (req, res) => {
  try {
    const { date, workType, volume, unit, workerName } = req.body;

    if (!date || !workType || !volume || !unit || !workerName) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    const newLog = await prisma.workLog.create({
      data: {
        date: new Date(date),
        workType,
        volume: Number(volume),
        unit,
        workerName,
      },
    });

    res.json(newLog);
  } catch (error) {
    res.status(500).json({
      error: "Failed to create log",
    });
  }
});

/**
 * DELETE LOG
 */
app.delete("/logs/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.workLog.delete({
      where: {
        id,
      },
    });

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete log",
    });
  }
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});

app.put("/logs/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      date,
      workType,
      volume,
      unit,
      workerName,
    } = req.body;

    const updatedLog = await prisma.workLog.update({
      where: {
        id,
      },

      data: {
        date: new Date(date),
        workType,
        volume: Number(volume),
        unit,
        workerName,
      },
    });

    res.json(updatedLog);
  } catch (error) {
    res.status(500).json({
      error: "Failed to update log",
    });
  }
});