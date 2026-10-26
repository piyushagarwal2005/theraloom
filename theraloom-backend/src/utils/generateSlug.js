/**
 * Utility to generate URL-safe slug from a string (e.g. "Dr. Ananya Sharma" -> "dr-ananya-sharma")
 * and check MongoDB for existing collisions, suffixing numbers if needed.
 */
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word characters (except spaces & dashes)
    .replace(/[\s_-]+/g, '-')   // Replace spaces and underscores with a single dash
    .replace(/^-+|-+$/g, '');   // Trim leading/trailing dashes
};

const getUniqueSlug = async (Model, baseName, currentId = null) => {
  let baseSlug = generateSlug(baseName);
  if (!baseSlug) baseSlug = 'therapist';
  
  let candidateSlug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug: candidateSlug };
    if (currentId) {
      query._id = { $ne: currentId };
    }
    const existing = await Model.findOne(query);
    if (!existing) {
      return candidateSlug;
    }
    candidateSlug = `${baseSlug}-${counter}`;
    counter++;
  }
};

module.exports = { generateSlug, getUniqueSlug };
