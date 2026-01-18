import { Router } from "express";
import { requireAdmin, AuthRequest, requireCommerceAccess } from "@/middleware/auth.middleware";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";
import { Plan, Role } from "@shared/types/entities";

const router = Router();

// Get all users accessible by the current user
router.get("/", requireAdmin(), async (req: AuthRequest, res) => {
  try {
    // Get admin-related commerces
    const adminCommerces = await prisma.userCommerce.findMany({
      where: { userId: req.user!.id },
      select: { commerceId: true },
    });

    const commerceIds = adminCommerces.map((c) => c.commerceId);

    // Get paginated users
    const users = await prisma.user.findMany({
      where: {
        commerces: {
          some: {
            commerceId: { in: commerceIds },
          },
        },
        // Exclude owners if the session user is not an owner
        ...(req.user?.role !== Role.OWNER && {
          role: {
            not: Role.OWNER,
          },
        }),
      },
      include: {
        commerces: {
          select: {
            commerce: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedUsers = users.map(user => ({
      ...user,
      commerces: user.commerces.map(c => c.commerce),
    }))

    return res.json(formattedUsers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener usuarios. Contacte al soporte" });
  }
});

// Create user
router.post("/", 
  requireAdmin(), 
  requireCommerceAccess({ mode: "direct", source: "body", key: "commerceIds" }), 
async (req: AuthRequest, res) => {
  try {
    const { name, email, role, plan, newPassword, occupation, commerceIds } = req.body;

    if (!name || !email || !role || !plan || !newPassword || !commerceIds) {
      return res.status(400).json({ error: "Todos los campos requeridos deben estar presentes" });
    }

    const authRes = await auth.api.signUpEmail({
      body: {
        email,
        occupation,
        password: newPassword,
        name,
        role: role as Role,
        plan: plan as Plan,
      },
    });

    const userId = authRes.user.id;

    await prisma.userCommerce.createMany({
      data: commerceIds.map((commerceId: string) => ({
        userId,
        commerceId,
      })),
    });

    return res.status(201).json({ user: authRes.user });
  } catch (error) {
    console.error(error);
    if (error instanceof APIError) {
      if (error.status === "UNPROCESSABLE_ENTITY") {
        return res.status(400).json({ error: "El email ya está en uso" });
      }
    }
    return res.status(500).json({ error: "Error al crear el usuario. Contacte al soporte" });
  }
});

// Update user
router.put("/:id", 
  requireAdmin(), 
  requireCommerceAccess({ mode: "direct", source: "body", key: "commerceIds" }), 
async (req: AuthRequest, res) => {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({
        error: "ID de usuario inválido",
      });
    }
    
    const { name, occupation, oldPassword, newPassword, commerceIds } = req.body;

    if (!name || !commerceIds) {
      return res.status(400).json({ error: "Nombre y comercios son requeridos" });
    }

    await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id },
        data: {
          name,
          occupation,
        },
      });

      if (!updatedUser) {
        throw new Error("Usuario no encontrado");
      }

      if (oldPassword && newPassword) {
        await auth.api.changePassword({
          body: {
            newPassword,
            currentPassword: oldPassword,
          },
        });
      }

      await tx.userCommerce.deleteMany({
        where: { userId: id },
      });

      await tx.userCommerce.createMany({
        data: commerceIds.map((commerceId: string) => ({
          userId: id,
          commerceId,
        })),
      });
    });

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    if (error instanceof APIError) {
      if (error.status === "UNAUTHORIZED") {
        return res.status(401).json({ error: "Las contraseñas no coinciden" });
      }
    }
    return res.status(500).json({ error: "Error al actualizar el usuario. Contacte al soporte" });
  }
});

// Delete user
router.delete("/:id", 
  requireAdmin(), 
  requireCommerceAccess({ mode: "user", userId: { from: "param", key: "id" } }), 
async (req: AuthRequest, res) => {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({
        error: "ID de usuario inválido",
      });
    }

    const { userCommerces } = req.body;

    if (!userCommerces) {
      return res.status(400).json({ error: "userCommerces es requerido" });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json(null);
    }

    await prisma.user.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al eliminar el usuario, contacte al soporte" });
  }
});

export default router;
