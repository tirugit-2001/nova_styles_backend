import InteriorEstimation from "../../../models/InteriorEstimation.schema";
import ConstructionEstimation from "../../../models/ConstructionEstimation.schema";

const getAllInteriorEstimations = async (filters: any = {}) => {
  const query: any = {};

  // Filter by interior type
  if (filters.interiorType && typeof filters.interiorType === "string" && filters.interiorType.trim() !== "") {
    query.interiorType = filters.interiorType;
  }

  // Filter by date range
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      const dateParts = filters.startDate.split("-");
      let start: Date;
      if (dateParts.length === 3) {
        start = new Date(Date.UTC(
          parseInt(dateParts[0]),
          parseInt(dateParts[1]) - 1,
          parseInt(dateParts[2]),
          0, 0, 0, 0
        ));
      } else {
        start = new Date(filters.startDate + "T00:00:00.000Z");
      }
      query.createdAt.$gte = start;
    }
    if (filters.endDate) {
      const dateParts = filters.endDate.split("-");
      let end: Date;
      if (dateParts.length === 3) {
        end = new Date(Date.UTC(
          parseInt(dateParts[0]),
          parseInt(dateParts[1]) - 1,
          parseInt(dateParts[2]),
          23, 59, 59, 999
        ));
      } else {
        end = new Date(filters.endDate + "T23:59:59.999Z");
      }
      query.createdAt.$lte = end;
    }
  }

  // Search by email or name
  if (filters.search && typeof filters.search === "string" && filters.search.trim() !== "") {
    const searchRegex = { $regex: filters.search, $options: "i" };
    query.$or = [
      { email: searchRegex },
      { name: searchRegex },
      { mobile: searchRegex },
    ];
  }

  // Build sort
  let sort: any = { createdAt: -1 }; // Default: newest first
  if (filters.sort) {
    const sortField = filters.sort.startsWith("-") ? filters.sort.substring(1) : filters.sort;
    const sortOrder = filters.sort.startsWith("-") ? -1 : 1;
    sort = { [sortField]: sortOrder };
  }

  const limit = filters.limit ? parseInt(filters.limit as string) : 10;
  const skip = filters.skip ? parseInt(filters.skip as string) : 0;

  const [data, total] = await Promise.all([
    InteriorEstimation.find(query).sort(sort).limit(limit).skip(skip).lean(),
    InteriorEstimation.countDocuments(query),
  ]);

  return {
    data,
    total,
    page: Math.floor(skip / limit) + 1,
    limit,
    pages: Math.ceil(total / limit),
  };
};

const getAllConstructionEstimations = async (filters: any = {}) => {
  const query: any = {};

  // Filter by building type
  if (filters.buildingType && typeof filters.buildingType === "string" && filters.buildingType.trim() !== "") {
    query.buildingType = filters.buildingType;
  }

  // Filter by project type
  if (filters.projectType && typeof filters.projectType === "string" && filters.projectType.trim() !== "") {
    query.projectType = filters.projectType;
  }

  // Filter by date range
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      const dateParts = filters.startDate.split("-");
      let start: Date;
      if (dateParts.length === 3) {
        start = new Date(Date.UTC(
          parseInt(dateParts[0]),
          parseInt(dateParts[1]) - 1,
          parseInt(dateParts[2]),
          0, 0, 0, 0
        ));
      } else {
        start = new Date(filters.startDate + "T00:00:00.000Z");
      }
      query.createdAt.$gte = start;
    }
    if (filters.endDate) {
      const dateParts = filters.endDate.split("-");
      let end: Date;
      if (dateParts.length === 3) {
        end = new Date(Date.UTC(
          parseInt(dateParts[0]),
          parseInt(dateParts[1]) - 1,
          parseInt(dateParts[2]),
          23, 59, 59, 999
        ));
      } else {
        end = new Date(filters.endDate + "T23:59:59.999Z");
      }
      query.createdAt.$lte = end;
    }
  }

  // Search by email or name
  if (filters.search && typeof filters.search === "string" && filters.search.trim() !== "") {
    const searchRegex = { $regex: filters.search, $options: "i" };
    query.$or = [
      { email: searchRegex },
      { name: searchRegex },
      { mobile: searchRegex },
    ];
  }

  // Build sort
  let sort: any = { createdAt: -1 }; // Default: newest first
  if (filters.sort) {
    const sortField = filters.sort.startsWith("-") ? filters.sort.substring(1) : filters.sort;
    const sortOrder = filters.sort.startsWith("-") ? -1 : 1;
    sort = { [sortField]: sortOrder };
  }

  const limit = filters.limit ? parseInt(filters.limit as string) : 10;
  const skip = filters.skip ? parseInt(filters.skip as string) : 0;

  const [data, total] = await Promise.all([
    ConstructionEstimation.find(query).sort(sort).limit(limit).skip(skip).lean(),
    ConstructionEstimation.countDocuments(query),
  ]);

  return {
    data,
    total,
    page: Math.floor(skip / limit) + 1,
    limit,
    pages: Math.ceil(total / limit),
  };
};

const getInteriorEstimationById = async (id: string) => {
  return InteriorEstimation.findById(id).lean();
};

const getConstructionEstimationById = async (id: string) => {
  return ConstructionEstimation.findById(id).lean();
};

const getEstimationStats = async () => {
  const [
    totalInterior,
    totalConstruction,
    interiorByType,
    constructionByType,
    recentInterior,
    recentConstruction,
  ] = await Promise.all([
    InteriorEstimation.countDocuments(),
    ConstructionEstimation.countDocuments(),
    InteriorEstimation.aggregate([
      {
        $group: {
          _id: "$interiorType",
          count: { $sum: 1 },
        },
      },
    ]),
    ConstructionEstimation.aggregate([
      {
        $group: {
          _id: "$buildingType",
          count: { $sum: 1 },
        },
      },
    ]),
    InteriorEstimation.find().sort({ createdAt: -1 }).limit(5).lean(),
    ConstructionEstimation.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  // Format interior by type
  const interiorByTypeMap: Record<string, number> = {};
  interiorByType.forEach((item: any) => {
    interiorByTypeMap[item._id || "Unknown"] = item.count;
  });

  // Format construction by type
  const constructionByTypeMap: Record<string, number> = {};
  constructionByType.forEach((item: any) => {
    constructionByTypeMap[item._id || "Unknown"] = item.count;
  });

  return {
    totalInterior,
    totalConstruction,
    interiorByType: interiorByTypeMap,
    constructionByType: constructionByTypeMap,
    recentSubmissions: [
      ...recentInterior.map((item: any) => ({ ...item, type: "interior" })),
      ...recentConstruction.map((item: any) => ({ ...item, type: "construction" })),
    ]
      .sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      })
      .slice(0, 10),
  };
};

const deleteInteriorEstimation = async (id: string) => {
  return InteriorEstimation.findByIdAndDelete(id);
};

const deleteConstructionEstimation = async (id: string) => {
  return ConstructionEstimation.findByIdAndDelete(id);
};

export default {
  getAllInteriorEstimations,
  getAllConstructionEstimations,
  getInteriorEstimationById,
  getConstructionEstimationById,
  getEstimationStats,
  deleteInteriorEstimation,
  deleteConstructionEstimation,
};

