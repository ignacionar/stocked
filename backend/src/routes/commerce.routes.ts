import { Router } from "express";
import { requireAuth, requireAdmin, AuthRequest, requireCommerceAccess } from "@/middleware/auth.middleware";
import prisma from "@/lib/prisma";
import { Role } from "@shared/types/entities";
import invoiceRoutes from '@/routes/invoice.routes';
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@/lib/auth";
import { Session } from "better-auth";

const router = Router();

router.use("/:commerceId/invoices", invoiceRoutes);

// Get all commerces for current user
router.get("/", requireAuth(), async (req: AuthRequest, res) => {
  try {
    let commerces;

    if (req.user?.role === Role.OWNER) {
      commerces = await prisma.commerce.findMany({
        orderBy: { createdAt: "desc" },
      });
    } else {
      const userCommerces = await prisma.userCommerce.findMany({
        where: {
          userId: req.user!.id,
        },
        include: {
          commerce: true,
        },
      });

      commerces = userCommerces.map((uc) => uc.commerce);
    }

    return res.json(commerces);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener sucursales. Contacte al soporte" });
  }
});

// Get single commerce
router.get("/:id", 
  requireAuth(), 
  requireCommerceAccess({ mode: "direct", source: "param", key: "id" }),
async (req: AuthRequest, res) => {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({
        error: "ID de comercio inválido",
      });
    }

    const commerce = await prisma.commerce.findUnique({
      where: { id },
    });

    if (!commerce) {
      return res.status(404).json(null);
    }

    return res.json(commerce);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener la sucursal. Contacte al soporte" });
  }
});

// Create commerce
router.post("/", requireAdmin(), async (req: AuthRequest, res) => {
  try {
    const { name, location } = req.body;

    if (!name || !location) {
      return res.status(400).json({ error: "Nombre y ubicación son requeridos" });
    }

    const commerce = await prisma.commerce.create({
      data: { name, location }
    });

    await prisma.userCommerce.create({
      data: {
        userId: req.user!.id,
        commerceId: commerce.id,
      },
    });

    return res.status(201).json(commerce);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al crear la sucursal. Contacte al soporte" });
  }
});

// Update commerce
router.put("/:id", 
  requireAdmin(), 
  requireCommerceAccess({ mode: "direct", source: "param", key: "id" }), 
async (req: AuthRequest, res) => {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({
        error: "ID de usuario inválido",
      });
    }
        
    const { name, location } = req.body;

    const commerce = await prisma.commerce.update({
      where: { id },
      data: {
        name,
        location,
      },
    });

    return res.json(commerce);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al actualizar la sucursal. Contacte al soporte" });
  }
});

// Delete commerce
router.delete("/:id", 
  requireAdmin(), 
  requireCommerceAccess({ mode: "direct", source: "param", key: "id" }),
async (req: AuthRequest, res) => {
  try {
    const result: any = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!result) {
      return res.status(401).json({ error: "No autorizado" })
    }

    const { session, user }: { session: Session, user: Session } = result

    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({
        error: "ID de comercio inválido",
      });
    }

    await prisma.$transaction(async (tx) => {
      const userLinks = await tx.userCommerce.findMany({
        where: { commerceId: id },
        select: { userId: true },
      });

      const userIds = userLinks.map((u) => u.userId);

      await tx.commerce.delete({
        where: { id },
      });

      for (const userId of userIds) {
        const count = await tx.userCommerce.count({
          where: { userId },
        });

        if (count === 0 && userId !== user.id) {
          await tx.user.delete({
            where: { id: userId },
          });
        }
      }
    });

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al eliminar la sucursal. Contacte al soporte" });
  }
});

export default router;
