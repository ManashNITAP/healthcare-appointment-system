/**
 * Symptom to Medical Specialty Mapping
 * Maps common symptoms to appropriate medical specialties
 */

export const symptomToSpecialtyMap = {
    // Neurological symptoms
    "headache": "Neurologist",
    "migraine": "Neurologist",
    "dizziness": "Neurologist",
    "vertigo": "Neurologist",
    "seizure": "Neurologist",
    "memory loss": "Neurologist",
    "confusion": "Neurologist",
    "numbness": "Neurologist",
    "tingling": "Neurologist",
    "tremor": "Neurologist",
    "balance problems": "Neurologist",
    
    // Gastrointestinal symptoms
    "stomach pain": "Gastroenterologist",
    "abdominal pain": "Gastroenterologist",
    "nausea": "Gastroenterologist",
    "vomiting": "Gastroenterologist",
    "diarrhea": "Gastroenterologist",
    "constipation": "Gastroenterologist",
    "bloating": "Gastroenterologist",
    "acid reflux": "Gastroenterologist",
    "heartburn": "Gastroenterologist",
    "indigestion": "Gastroenterologist",
    "stomach ache": "Gastroenterologist",
    
    // Respiratory symptoms
    "cough": "General physician",
    "fever": "General physician",
    "cold": "General physician",
    "sore throat": "General physician",
    "runny nose": "General physician",
    "congestion": "General physician",
    "shortness of breath": "General physician",
    "chest congestion": "General physician",
    "flu": "General physician",
    
    // Cardiovascular symptoms
    "chest pain": "Cardiologist",
    "heart palpitations": "Cardiologist",
    "irregular heartbeat": "Cardiologist",
    "high blood pressure": "Cardiologist",
    "low blood pressure": "Cardiologist",
    "chest tightness": "Cardiologist",
    "heartburn": "Cardiologist",
    
    // Dermatological symptoms
    "skin rash": "Dermatologist",
    "rash": "Dermatologist",
    "acne": "Dermatologist",
    "eczema": "Dermatologist",
    "psoriasis": "Dermatologist",
    "itching": "Dermatologist",
    "skin infection": "Dermatologist",
    "mole": "Dermatologist",
    "skin discoloration": "Dermatologist",
    "hair loss": "Dermatologist",
    
    // Gynecological symptoms (for women)
    "menstrual pain": "Gynecologist",
    "irregular periods": "Gynecologist",
    "pelvic pain": "Gynecologist",
    "vaginal discharge": "Gynecologist",
    "pregnancy": "Gynecologist",
    "fertility": "Gynecologist",
    
    // Pediatric symptoms
    "child fever": "Pediatricians",
    "child cough": "Pediatricians",
    "child development": "Pediatricians",
    "vaccination": "Pediatricians",
    
    // General symptoms
    "fatigue": "General physician",
    "weakness": "General physician",
    "body ache": "General physician",
    "joint pain": "General physician",
    "back pain": "General physician",
    "weight loss": "General physician",
    "weight gain": "General physician",
    "insomnia": "General physician",
    "anxiety": "General physician",
    "depression": "General physician"
};

/**
 * Map symptoms to specialty
 * @param {string} symptomsText - User's symptom description
 * @returns {string} - Recommended specialty
 */
export const mapSymptomsToSpecialty = (symptomsText) => {
    if (!symptomsText) return "General physician";
    
    const lowerText = symptomsText.toLowerCase();
    const symptoms = lowerText.split(/[,\s]+/);
    
    // Find matching specialty
    for (const [symptom, specialty] of Object.entries(symptomToSpecialtyMap)) {
        if (lowerText.includes(symptom)) {
            return specialty;
        }
    }
    
    // Default to General physician if no match
    return "General physician";
};

/**
 * Get all specialties
 * @returns {Array} - List of all specialties
 */
export const getAllSpecialties = () => {
    return [...new Set(Object.values(symptomToSpecialtyMap))];
};

