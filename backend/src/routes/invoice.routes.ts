import { Router } from "express";
import multer from "multer";
import { requireAuth, requireCommerceAccess, AuthRequest } from "@/middleware/auth.middleware";
import prisma from "@/lib/prisma";
import { invoiceQueue } from "@/lib/queues/invoice.queue";
import { JobStatus, Role } from "@shared/types/entities";

const router = Router({ mergeParams: true });

// Get all invoice jobs for a commerce
router.get("/", 
  requireAuth(), 
  requireCommerceAccess({ mode: "direct", source: "param", key: "commerceId" }),  
async (req: AuthRequest, res) => {
  try {
    const commerceId = req.params.commerceId;

    if (typeof commerceId !== "string") {
      return res.status(400).json({
        error: "ID de comercio inválido",
      });
    }

    let jobs;

    if (req.user?.role === Role.USER) {
      jobs = await prisma.invoiceJob.findMany({
        where: { commerceId, userId: req.user.id },
        orderBy: { createdAt: "desc" },
      });
    } else {
      jobs = await prisma.invoiceJob.findMany({
        where: {
          commerceId,
          user: req.user?.role === Role.OWNER ? {} : {
            role: {
              not: Role.OWNER,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      });
    }

    return res.json(jobs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener procesos de facturas." });
  }
});

// Get a specific invoice job
router.get("/:jobId", 
  requireAuth(), 
  requireCommerceAccess({ mode: "direct", source: "param", key: "commerceId" }),  
async (req: AuthRequest, res) => {
  try {
    const jobId = req.params.jobId;

    if (typeof jobId !== "string") {
      return res.status(400).json({
        error: "ID de item inválido",
      });
    }
    
    const job = await prisma.invoiceJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return res.status(404).json(null);
    }

    return res.json(job);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener el proceso de facturas." });
  }
});

// Create a new invoice job

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 } 
});

router.post(
  "/",
  upload.array("files"), 
  requireAuth(),
  requireCommerceAccess({ mode: "direct", source: "param", key: "commerceId" }),  
async (req: AuthRequest, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const { commerceId, userId } = req.body;

      if (!commerceId || !userId) {
        return res.status(400).json({ error: "Se requiere establecer datos de usuario y comercio" });
      }

      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No se han proporcionado archivos" });
      }

      const job = await prisma.invoiceJob.create({
        data: {
          commerceId,
          filesCount: files.length,
          status: JobStatus.PENDING,
          userId,
        },
      });

      const buffers = files.map((f) => ({
        name: f.originalname,
        type: f.mimetype,
        buffer: f.buffer.toString("base64"),
      }));

      await invoiceQueue.add("invoice-processing", {
        jobId: job.id,
        files: buffers,
      });

      return res.status(201).json(job);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error al crear el proceso de facturas. Contacte al soporte." });
    }
  }
);

// Delete an invoice job
router.delete("/:jobId", 
  requireAuth(), 
  requireCommerceAccess({ mode: "direct", source: "param", key: "commerceId" }),  
async (req: AuthRequest, res) => {
  try {
    const jobId = req.params.jobId;

    if (typeof jobId !== "string") {
      return res.status(400).json({
        error: "ID de item inválido",
      });
    }
    
    const job = await invoiceQueue.getJob(jobId);

    if (job) {
      await job.remove();
    }

    await prisma.invoiceJob.delete({
      where: { id: jobId },
    });

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al eliminar el proceso de facturas. Contacte al soporte." });
  }
});

// Update invoice job status
router.patch("/:jobId/status", 
  requireAuth(), 
  requireCommerceAccess({ mode: "direct", source: "param", key: "commerceId" }),
async (req: AuthRequest, res) => {
  try {
    const jobId = req.params.jobId;

    if (typeof jobId !== "string") {
      return res.status(400).json({
        error: "ID de item inválido",
      });
    }
    
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "El campo status es requerido" });
    }

    await prisma.invoiceJob.update({
      where: { id: jobId },
      data: { status },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al actualizar el estado del proceso de facturas. Contacte al soporte." });
  }
});

// Update invoice job response
router.patch("/:jobId/response", 
  requireAuth(), 
  requireCommerceAccess({ mode: "direct", source: "param", key: "commerceId" }),
async (req: AuthRequest, res) => {
  try {
    const jobId = req.params.jobId;

    if (typeof jobId !== "string") {
      return res.status(400).json({
        error: "ID de item inválido",
      });
    }
        
    const { response, filesCount } = req.body;

    if (!filesCount) {
      // Delete if no files
      const job = await invoiceQueue.getJob(jobId);
      if (job) {
        await job.remove();
      }
      await prisma.invoiceJob.delete({
        where: { id: jobId },
      });
    } else {
      await prisma.invoiceJob.update({
        where: { id: jobId },
        data: { response, filesCount },
      });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al actualizar la información de las facturas. Contacte al soporte." });
  }
});

// Accept invoice analysis and save to stock
router.post("/accept", 
  requireAuth(), 
  requireCommerceAccess({ mode: "direct", source: "param", key: "commerceId" }),
async (req: AuthRequest, res) => {
  try {
    const { items, supplier, commerceId } = req.body;

    if (!items ||  !commerceId) {
      return res.status(400).json({ error: "Se requieren items e ID de comercio" });
    }

    const commerce = await prisma.commerce.findUnique({
      where: { id: commerceId },
    });
    
    if (!commerce) {
      return res.status(404).json({ error: `No se encontró la sucursal asociada ${commerceId}` });
    }

    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const existing = await tx.stock.findFirst({
          where: { name: item.name, commerceId },
        });

        if (existing) {
          await tx.stock.update({
            where: { id: existing.id },
            data: {
              quantity: { increment: item.quantity },
              price: item.unit_price,
              measure: item.measure,
            },
          });
        } else {
          await tx.stock.create({
            data: {
              name: item.name,
              quantity: item.quantity,
              price: item.unit_price,
              measure: item.measure,
              supplier: supplier ?? "",
              commerce: {
                connect: { id: commerceId },
              },
            },
          });
        }
      }
    });

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al aceptar el análisis de la factura. Contacte al soporte." });
  }
});

export default router;
