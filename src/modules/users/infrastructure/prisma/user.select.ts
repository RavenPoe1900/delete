import { Prisma } from '@prisma/client';

export const userSelectWithoutPassword: Prisma.UserSelect = {
  id: true,
  email: true,
  phone: true,
  roles: {
    select: {
      role: true,
    },
  },
  lastUsedRole: true,
  tripsAsShipper: {
    select: {
      id: true,
      status: true,
      totalAmount: true,
    },
  },
  tripsAsCarrier: {
    select: {
      id: true,
      status: true,
      totalAmount: true,
    },
  },
  vehicles: {
    select: {
      id: true,
      plate: true,
      type: true,
    },
  },
  carrierAccount: {
    select: {
      id: true,
      balance: true,
      currency: true,
    },
  },
  averageRatingAsShipper: true,
  totalRatingsAsShipper: true,
  averageRatingAsCarrier: true,
  totalRatingsAsCarrier: true,
  ratingsGiven: {
    select: {
      id: true,
      stars: true,
      comment: true,
    },
  },
  ratingsReceived: {
    select: {
      id: true,
      stars: true,
      comment: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;
