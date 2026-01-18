import { Router } from "express";
import { requireAuth, AuthRequest, requireCommerceAccess } from "@/middleware/auth.middleware";
import prisma from "@/lib/prisma";

const router = Router();

// Get all stock for a commerce
router.get(
  "/commerce/:commerceId",
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

      const stockItems = await prisma.stock.findMany({
        where: { commerceId },
      });

      return res.json(stockItems);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Error al obtener productos. Contacte al soporte." });
    }
  }
);

// Create stock
router.post("/", 
  requireAuth(), 
  requireCommerceAccess({ mode: "direct", source: "body", key: "commerceId" }),
  async (req: AuthRequest, res) => {
  try {
    const { name, supplier, measure, quantity, price, commerceId } = req.body;

    if (!name) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    if (!supplier) {
      return res.status(400).json({ error: "El proveedor es obligatorio" });
    }

    // Validate commerce access
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { commerces: true },
    });

    const hasAccess = user?.commerces.some((uc) => uc.commerceId === commerceId);

    if (!hasAccess && req.user?.role !== "OWNER") {
      return res.status(403).json({ error: "No autorizado para este comercio" });
    }

    const existingStock = await prisma.stock.findFirst({
      where: {
        name,
        commerceId,
      },
      select: { id: true },
    });

    if (existingStock) {
      return res.status(400).json({ error: "Ya existe un producto con ese nombre" });
    }

    const stock = await prisma.stock.create({
      data: {
        name,
        supplier,
        measure,
        quantity,
        price,
        commerceId,
      },
    });

    return res.status(201).json(stock);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al crear el producto. Contacte al soporte." });
  }
});

// Update stock
router.put("/:id", 
  requireAuth(), 
  requireCommerceAccess({ mode: "user", userId: { from: "body", key: "id" }}),
async (req: AuthRequest, res) => {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({
        error: "ID de item inválido",
      });
    }

    const { name, supplier, measure, quantity, price } = req.body;

    const stock = await prisma.stock.findUnique({
      where: { id },
      select: { commerceId: true },
    });

    if (!stock) {
      return res.status(404).json(null);
    }

    // Validate commerce access
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { commerces: true },
    });

    const hasAccess = user?.commerces.some((uc) => uc.commerceId === stock.commerceId);

    if (!hasAccess && req.user?.role !== "OWNER") {
      return res.status(403).json({ error: "No autorizado para este comercio" });
    }

    if (!name) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    if (!supplier) {
      return res.status(400).json({ error: "El proveedor es obligatorio" });
    }

    const existingStock = await prisma.stock.findFirst({
      where: {
        name,
        commerceId: stock.commerceId,
        NOT: { id },
      },
      select: { id: true },
    });

    if (existingStock) {
      return res.status(400).json({ error: "Ya existe un producto con ese nombre" });
    }

    const updatedStock = await prisma.stock.update({
      where: { id },
      data: {
        name,
        supplier,
        measure,
        quantity,
        price,
      },
    });

    return res.json(updatedStock);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al actualizar el producto. Contacte al soporte." });
  }
});

// Delete stock
router.delete("/:id", 
  requireAuth(), 
  requireCommerceAccess({ mode: "user", userId: { from: "body", key: "id" }}), 
async (req: AuthRequest, res) => {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({
        error: "ID de item inválido",
      });
    }

    const stock = await prisma.stock.findUnique({
      where: { id },
      select: { commerceId: true },
    });

    if (!stock) {
      return res.status(404).json(null);
    }

    await prisma.stock.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al eliminar el producto. Contacte al soporte." });
  }
});

// Get all suppliers for a commerce
router.get("/suppliers/:commerceId", requireAuth(), async (req: AuthRequest, res) => {
  try {
    const commerceId = req.params.commerceId;

    if (typeof commerceId !== "string") {
      return res.status(400).json({
        error: "ID de comercio inválido",
      });
    }

    // Validate commerce access
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { commerces: true },
    });

    const hasAccess = user?.commerces.some((uc) => uc.commerceId === commerceId);

    if (!hasAccess && req.user?.role !== "OWNER") {
      return res.status(403).json({ error: "No autorizado para este comercio" });
    }

    const suppliers = await prisma.stock.findMany({
      where: { commerceId },
      distinct: ["supplier"],
      select: { supplier: true },
    });

    return res.json(suppliers.map((s) => s.supplier));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener proveedores. Contacte al soporte." });
  }
});

export default router;
