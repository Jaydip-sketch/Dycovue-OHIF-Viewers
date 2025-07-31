export default function getModalities(Modality, ModalitiesInStudy) {
  if (!Modality && !ModalitiesInStudy) {
    return {};
  }

  // Initialize modalities with default if Modality is not provided
  const modalities = Modality || {
    vr: 'CS',
    Value: [],
  };

  // Ensure modalities.Value is always an array
  modalities.Value = Array.isArray(modalities.Value) ? modalities.Value : [];

  // Check if ModalitiesInStudy exists and has a valid Value array
  if (ModalitiesInStudy && Array.isArray(ModalitiesInStudy.Value)) {
    if (modalities.vr && modalities.vr === ModalitiesInStudy.vr) {
      // Merge unique values from ModalitiesInStudy into modalities
      ModalitiesInStudy.Value.forEach(value => {
        if (modalities.Value.indexOf(value) === -1) {
          modalities.Value.push(value);
        }
      });
    } else {
      // Return ModalitiesInStudy if VRs don't match
      return ModalitiesInStudy;
    }
  }

  return modalities;
}
