export type LaptopRecord = {
  id: string;
  /** Optional — stored for future use, not used for read filtering. */
  userId?: string;
  laptopName?: string;
  details?: string;
  shopNumber?: string;
  shopKeeperNumber?: string;
  price?: string;
  visitDate: string;
  createdAt: Date;
};

export type CreateLaptopInput = {
  laptopName?: string;
  details?: string;
  shopNumber?: string;
  shopKeeperNumber?: string;
  price?: string;
};

export type LaptopVisitGroup = {
  visitDate: string;
  label: string;
  laptops: LaptopRecord[];
};
