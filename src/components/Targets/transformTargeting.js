
// we have two sources of targeting data that need to be transformed into (identical) buttons.
// 1. a targeting row
// 2. params from the URL into a button (or, params specified in constants.js )


const GENDER_CROSSWALK = {
    "MALE": "men",
    "FEMALE": "women"
}

const EDUCATION_STATUSES = {
  EDU_MASTER_DEGREE: "Master's degree",
  EDU_DOCTORATE_DEGREE: 'Doctorate',
  EDU_COLLEGE_ALUMNUS: 'College degree',
  EDU_PROFESSIONAL_DEGREE: 'Professional degree',
};


const friendlyRelationshipStatus = (subcategory) => {
  const relationship_status = {
    4: 'Married',
    0: 'Unspecified',
    5: 'Engaged',
    1: 'Single',
  };
  try {
    return (
      relationship_status[subcategory] || subcategory
    );
  } catch (e) {
    console.log('Unable to parse targeting subcategory', subcategory);
    return subcategory;
  }
};

const subcategoryJsonToSubcategories = (waist_ui_type, subcategory_json) => {
  // returns an array of subcategories, given the JSON from the targeting row in the DB.
  switch (waist_ui_type) {
    case 'CUSTOM_AUDIENCES_DATAFILE':      return [subcategory_json["ca_owner_name"]];
    case "Match Key":                      return [subcategory_json["match_keys"]];
    case 'INTERESTS':                      return subcategory_json.map((interest) => interest.name);
    case 'RELATIONSHIP_STATUS':            return [subcategory_json.relationship_status];
    case 'LOCATION':                       return [subcategory_json.location_name];
    case 'MinAge':                         return [subcategory_json["age_min"] + 12];
    case 'MaxAge':                         return [subcategory_json["age_max"] + 12];
    case 'Gender':                         return [GENDER_CROSSWALK[subcategory_json["gender"]]];
    case 'WORK_EMPLOYERS':                 return [subcategory_json.employer_name];
    case 'WORK_JOB_TITLES':                return [subcategory_json.job_title];
    case 'BCT':                            return [subcategory_json.name];
    case 'ED_STATUS':                      return [EDUCATION_STATUSES[subcategory_json.edu_status] || subcategory_json.edu_status];
    case 'EDU_SCHOOLS':                    return subcategory_json.school_ids;
    case 'LOCALE':                         return subcategory_json.locales.replace("{", "").replace("}", "").split(",")
    case 'ACTIONABLE_INSIGHTS':            return [subcategory_json.description];
    case 'FRIENDS_OF_CONNECTION':          return [subcategory_json.name];
    case 'CONNECTION':                     return [subcategory_json.name];
    case 'COLLABORATIVE_AD':               return [subcategory_json.merchant_name];
    case 'COLLABORATIVE_ADS_STORE_SALES':  return [subcategory_json.merchant_name];
    case 'COLLABORATIVE_ADS_STORE_VISITS': return [subcategory_json.merchant_name];
    default: return [];
  }
}

const getTargetingNicenames = (filter_target, filter_segment) => {
  switch (filter_target) {
    case 'CUSTOM_AUDIENCES_DATAFILE':            return {target_nicename: "List", segment_nicename: `uploaded by ${filter_segment}` }
    case "Match Key":                            return {target_nicename: "List matched by" }
    case 'INTERESTS':                            return {target_nicename: 'Interested in' }
    case 'RELATIONSHIP_STATUS':                  return {target_nicename: 'Relationship status' }
    case 'LOCATION':                             return {target_nicename: "Location"}
    case 'MinAge':                               return {target_nicename: "Min Age"}
    case 'MaxAge':                               return {target_nicename: "Max Age"}
    case 'Gender':                               return {target_nicename: "Gender"} // doesn't need anything, both the filter_target and filter_segment can be presented as is.
    case 'WORK_EMPLOYERS':                       return {target_nicename: "Employer"}
    case 'WORK_JOB_TITLES':                      return {target_nicename: "Job title"}
    case 'ED_STATUS':                            return {target_nicename: "Education status"}
    case 'EDU_SCHOOLS':                          return {target_nicename: 'School' }
    case 'LOCALE':                               return {target_nicename: 'Speakers of' }
    case 'ACTIONABLE_INSIGHTS':                  return {target_nicename: 'Behavior' }
    case 'FRIENDS_OF_CONNECTION':                return {target_nicename: 'Your friends like' }
    case 'CONNECTION':                           return {target_nicename: 'You like' }
    case 'COLLABORATIVE_AD':                     return {target_nicename: 'Brand/Store Collaborative Ad' }
    case 'COLLABORATIVE_ADS_STORE_SALES':        return {target_nicename: 'Brand/Store Collaborative Ad (Sales)' }
    case 'COLLABORATIVE_ADS_STORE_VISITS':       return {target_nicename: 'Brand/Store Collaborative Ad (Visits)' }
    case 'CUSTOM_AUDIENCES_ENGAGEMENT_PAGE':     return {target_nicename: 'Online behavior', segment_nicename: 'visited a particular Facebook page'};
    case 'CUSTOM_AUDIENCES_ENGAGEMENT_VIDEO':    return {target_nicename: 'Online behavior', segment_nicename: 'watched a particular video'};
    case 'CUSTOM_AUDIENCES_ENGAGEMENT_IG':       return {target_nicename: 'Online behavior', segment_nicename: 'visited a particular Instagram page'};
    case 'CUSTOM_AUDIENCES_WEBSITE':             return {target_nicename: 'Online behavior', segment_nicename: 'visited a particular website'};
    case 'CUSTOM_AUDIENCES_MOBILE_APP':          return {target_nicename: 'Online behavior', segment_nicename: 'used a particular app'};
    case 'CUSTOM_AUDIENCES_ENGAGEMENT_EVENT':    return {target_nicename: 'Online behavior', segment_nicename: 'engagement event'};
    case 'CUSTOM_AUDIENCES_OFFLINE':             return {target_nicename: 'Online behavior', segment_nicename: 'offline data'};
    case 'CUSTOM_AUDIENCES_STORE_VISITS':        return {target_nicename: 'Online behavior', segment_nicename: 'store visits'};
    case 'CUSTOM_AUDIENCES_ENGAGEMENT_CANVAS':   return {target_nicename: 'Online behavior', segment_nicename: 'canvas engagement'};
    case 'CUSTOM_AUDIENCES_ENGAGEMENT_LEAD_GEN': return {target_nicename: 'Online behavior', segment_nicename: 'filled out a lead gen form'};
    case 'CUSTOM_AUDIENCES_LOOKALIKE':           return {target_nicename: 'Similarity', segment_nicename: 'Lookalike Audience'};
    case 'DYNAMIC_RULE':                         return {target_nicename: 'Dynamic Rule'};
    case 'BCT':
      if (filter_segment.match(/Likely engagement with US political content/)) {
        const match = filter_segment
            .match(/(Likely engagement with US political content) \((.*)\)/)
        return {target_nicename: match[1], segment_nicename: match[2]};
      }
      if (filter_segment.match(/Household income/)) {
        const match = filter_segment.match(/(Household income): (.*) \(/)
        return {target_nicename: match[1], segment_nicename: match[2]};
      }
      if (
        [
          'African American (US)',
          'Hispanic (US - All)',
          'Asian American (US)',
          'Hispanic (US - Bilingual)',
          'Hispanic (US - English dominant)',
          'Hispanic (US - Spanish dominant)',
        ].includes(filter_segment)
      ) {
        return {target_nicename: "Multicultural affinity", segment_nicename: filter_segment};
      }
      return {target_nicename: "Behavioral Targeting", filter_segment: filter_segment};  

    default: return [];
  }
}

// this is the method for URL data. It's one to one.
export const filterDataToButtons = (filter_target, filter_segment) => {
  return {filter_target: filter_target, filter_segment: filter_segment, ...getTargetingNicenames(filter_target, filter_segment)}
}

// this is the method for DB-sourced data. It's many-to-one.
export const targetingLineToButtons = (waist_ui_type, subcategory_json) => {
  // map a targeting row to N objects like {"filter_target", filter_segment, [target_nicename, "segment_nicename"] }
  // where filter_target and filter_segment are meant to be consumed by app.py (and stored in the URL)
  // and the nicenames are displayed to the user, if present, otherwise, the filter_target/filter_segment is displayed
  let targets_json = null;
  switch (waist_ui_type) {
    case 'CUSTOM_AUDIENCES_DATAFILE':
      return subcategoryJsonToSubcategories(waist_ui_type, subcategory_json).map((filter_segment) => ({filter_target: waist_ui_type, filter_segment: filter_segment, ...getTargetingNicenames(waist_ui_type, filter_segment)})).concat(
             subcategory_json["match_keys"].length == 0 ? [] : subcategoryJsonToSubcategories("Match Key", subcategory_json).map((filter_segment) => ({filter_target: "Match Key", filter_segment: filter_segment, ...getTargetingNicenames("Match Key", filter_segment)}))
        );
    case 'AGE_GENDER':
      const gender = subcategory_json["gender"] === "ANY" ? [] : subcategoryJsonToSubcategories("Gender", subcategory_json).map((filter_segment) => ({filter_target: "Gender", filter_segment: filter_segment, ...getTargetingNicenames("Gender", filter_segment)}))
      const minage = subcategoryJsonToSubcategories("MinAge", subcategory_json).map((filter_segment) => ({filter_target: "MinAge", filter_segment: filter_segment, ...getTargetingNicenames("MinAge", filter_segment)}))
      const maxage = subcategoryJsonToSubcategories("MaxAge", subcategory_json).map((filter_segment) => ({filter_target: "MaxAge", filter_segment: filter_segment, ...getTargetingNicenames("MaxAge", filter_segment)}))
      return gender.concat(minage).concat(maxage)
    case 'BCT':
    case 'INTERESTS':
    case 'RELATIONSHIP_STATUS':
    case 'LOCATION':
    case 'WORK_EMPLOYERS':
    case 'WORK_JOB_TITLES':
    case 'CUSTOM_AUDIENCES_ENGAGEMENT_PAGE':
    case 'CUSTOM_AUDIENCES_ENGAGEMENT_VIDEO':
    case 'CUSTOM_AUDIENCES_ENGAGEMENT_IG':
    case 'CUSTOM_AUDIENCES_WEBSITE':
    case 'CUSTOM_AUDIENCES_MOBILE_APP':
    case 'CUSTOM_AUDIENCES_ENGAGEMENT_EVENT':
    case 'CUSTOM_AUDIENCES_OFFLINE':
    case 'CUSTOM_AUDIENCES_STORE_VISITS':
    case 'CUSTOM_AUDIENCES_ENGAGEMENT_CANVAS':
    case 'CUSTOM_AUDIENCES_ENGAGEMENT_LEAD_GEN':
    case 'CUSTOM_AUDIENCES_LOOKALIKE':
    case 'DYNAMIC_RULE':
    case 'ED_STATUS':
    case 'EDU_SCHOOLS':
    case 'LOCALE':
    case 'ACTIONABLE_INSIGHTS':
    case 'FRIENDS_OF_CONNECTION':
    case 'CONNECTION':
    case 'COLLABORATIVE_AD':
    case 'COLLABORATIVE_ADS_STORE_SALES':
    case 'COLLABORATIVE_ADS_STORE_VISITS':
      return subcategoryJsonToSubcategories(waist_ui_type, subcategory_json).map((filter_segment) => ({filter_target: waist_ui_type, filter_segment: filter_segment, ...getTargetingNicenames(waist_ui_type, filter_segment)}))
    default:
      return [];
  }
}