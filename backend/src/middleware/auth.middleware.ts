import { Request, Response, NextFunction } from "express";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Plan, Role } from "@shared/types/entities";
import { fromNodeHeaders } from "better-auth/node";
import { User, Session } from "better-auth";

type AuthUser = User & {
  role: string;
  plan: string;
  occupation?: string | null;
};

type FormattedUser = Omit<AuthUser, "role" | "plan"> & {
  role: Role;
  plan: Plan;
};

export interface AuthRequest extends Request {
  user?: FormattedUser;
}

export async function authorizeUserAccess(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
  options: {
    needsAdminAccess?: boolean;
    commercesIds?: string[] | null;
  } = {}
) {
  try {
    const result: { user: AuthUser, session: Session } | null = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!result) {
      return res.status(401).json({ error: "No autorizado" })
    }

    const { user, session } = result;

    console.log("USER RESULT TEST", user)

    if (!session) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const userObject: FormattedUser = {
      ...user,
      plan: user.plan as Plan,
      role: user.role as Role,
      occupation: user.occupation || "",
    };

    if (user?.role === Role.OWNER) {
      req.user = userObject;
      return next();
    }

    if (options.needsAdminAccess && user?.role === Role.USER) {
      return res.status(403).json({ error: "No autorizado" });
    }

    if (options.commercesIds) {
      const user = await prisma.user.findUnique({
        where: { id: userObject.id },
        include: { commerces: true },
      });

      const userCommerces = user?.commerces.map((uc) => uc.commerceId) || [];

      const hasAccess = options.commercesIds.every((cid) =>
        userCommerces.includes(cid)
      );

      if (!hasAccess) {
        return res.status(403).json({ error: "No autorizado" });
      }
    }

    req.user = userObject;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: "No autorizado" });
  }
}

export function requireAuth() {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    return authorizeUserAccess(req, res, next);
  };
}

export function requireAdmin() {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    return authorizeUserAccess(req, res, next, { needsAdminAccess: true });
  };
}

type UserIdSource =
  | { from: "param"; key: string }
  | { from: "body"; key: string };

type CommerceAccessConfig =
  | {
      mode: "direct";
      source: "body";
      key?: string; // default: commerceIds
    }
  | {
      mode: "direct";
      source: "param";
      key: string;
    }
  | {
      mode: "user";
      userId: UserIdSource;
    };

export function requireCommerceAccess(config: CommerceAccessConfig) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      let commerceIds: string[] = [];

      if (config.mode === "direct") {
        if (config.source === "body") {
          const key = config.key ?? "commerceIds";
          const value = (req.body as any)?.[key];

          if (!Array.isArray(value) || value.some(v => typeof v !== "string")) {
            return res.status(400).json({ error: "ID de comercio inválido" });
          }

          commerceIds = value;
        }

        if (config.source === "param") {
          const value = req.params[config.key];

          if (typeof value !== "string") {
            return res.status(400).json({ error: "ID de comercio inválido" });
          }

          commerceIds = [value];
        }
      }

      if (config.mode === "user") {
        let userId: unknown;

        if (config.userId.from === "param") {
          userId = req.params[config.userId.key];
        }

        if (config.userId.from === "body") {
          userId = (req.body as any)?.[config.userId.key];
        }

        if (typeof userId !== "string") {
          return res.status(400).json({ error: "ID de usuario inválido" });
        }

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            commerces: {
              select: { commerceId: true },
            },
          },
        });

        if (!user) {
          return res.status(404).json({ error: "Usuario no encontrado" });
        }

        commerceIds = user.commerces.map(c => c.commerceId);
      }

      return authorizeUserAccess(req, res, next, {
        commercesIds: commerceIds,
      });
    } catch (err) {
      console.error(err);
      return res.status(403).json({ error: "No autorizado" });
    }
  };
}