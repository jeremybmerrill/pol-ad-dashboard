const GENDER_CROSSWALK = {
    "MALE": "men",
    "FEMALE": "women"
}

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

  // CASE waist_ui_type
  //   WHEN 'ACTIONABLE_INSIGHTS' THEN jsonb_build_object('description', description)
  //   WHEN 'AGE_GENDER' THEN jsonb_build_object('age_min', age_min, 'age_max', age_max, 'gender', gender)
  //   WHEN 'BCT' THEN jsonb_build_object('name', name)
  //   WHEN 'CONNECTION' THEN jsonb_build_object('name', name)
  //   WHEN 'CUSTOM_AUDIENCES_DATAFILE' THEN jsonb_build_object('match_keys', dfca_data#>'{match_keys}', 'ca_owner_name', dfca_data#>'{ca_owner_name}')
  //   WHEN 'CUSTOM_AUDIENCES_LOOKALIKE' THEN jsonb_build_object('ca_owner_name', dfca_data#>'{ca_owner_name}')
  //   WHEN 'ED_STATUS' THEN jsonb_build_object('edu_status', edu_status)
  //   WHEN 'EDU_SCHOOLS' THEN school_names
  //   WHEN 'FRIENDS_OF_CONNECTION' THEN jsonb_build_object('name', name)
  //   WHEN 'INTERESTS' THEN interests
  //   WHEN 'LOCALE' THEN jsonb_build_object('locales', locales)
  //   WHEN 'LOCATION' THEN jsonb_build_object('location_name', location_name, 'location_type', location_type)
  //   WHEN 'RELATIONSHIP_STATUS' THEN serialized_data
  //   WHEN 'WORK_JOB_TITLES' THEN job_title
  //   WHEN 'WORK_EMPLOYERS' THEN employer_name
  //   WHEN 'COLLABORATIVE_AD' THEN merchant_name
  //   WHEN 'COLLABORATIVE_ADS_STORE_VISITS' THEN merchant_name
  //   WHEN 'COLLABORATIVE_ADS_STORE_SALES' THEN merchant_name
  //   ELSE NULL
  // END AS subcategory_json,

    // CASE waist_ui_type
    //   WHEN 'ACTIONABLE_INSIGHTS' THEN description
    //   WHEN 'AGE_GENDER' THEN concat(age_min, '-', age_max, ' ', gender)
    //   WHEN 'BCT' THEN name
    //   WHEN 'CONNECTION' THEN name
    // WHEN 'CUSTOM_AUDIENCES_DATAFILE' THEN jsonb_build_object('match_keys', dfca_data#>'{match_keys}', 'ca_owner_name', dfca_data#>'{ca_owner_name}')#>>'{}'
    // WHEN 'CUSTOM_AUDIENCES_LOOKALIKE' THEN dfca_data#>>'{ca_owner_name}'
    //   WHEN 'ED_STATUS' THEN edu_status
    //   WHEN 'EDU_SCHOOLS' THEN string_agg(school_names)
    //   WHEN 'FRIENDS_OF_CONNECTION' THEN name
    //   WHEN 'INTERESTS' THEN interests#>> '{}'
    //   WHEN 'LOCALE' THEN locales
    //   WHEN 'LOCATION' THEN concat(location_name, ' (', location_type, ')')
    //   WHEN 'RELATIONSHIP_STATUS' THEN relationship_status
    //   WHEN 'WORK_JOB_TITLES' THEN job_title
    //   WHEN 'WORK_EMPLOYERS' THEN employer_name
    //   WHEN 'COLLABORATIVE_AD' THEN merchant_name
    //   WHEN 'COLLABORATIVE_ADS_STORE_VISITS' THEN merchant_name
    //   WHEN 'COLLABORATIVE_ADS_STORE_SALES' THEN merchant_name      
    //   ELSE NULL
    // END AS subcategory



export const targetingLineToButtons = (waist_ui_type, subcategory_json) => {
  // map a targeting row to N objects like {"filter_target", filter_segment, [target_nicename, "segment_nicename"] }
  // where filter_target and filter_segment are meant to be consumed by app.py (and stored in the URL)
  // and the nicenames are displayed to the user, if present, otherwise, the filter_target/filter_segment is displayed
  let targets_json = null;
  switch (waist_ui_type) {
    case 'CUSTOM_AUDIENCES_DATAFILE':
      targets_json = {filter_target: "List"};
      if (!subcategory_json) return [targets_json];
      return [
        {target_nicename: "List matched by", filter_target: "Match Key", filter_segment: subcategory_json["match_keys"]},
        {...targets_json, filter_segment: subcategory_json["ca_owner_name"], "segment_nicename": `uploaded by ${subcategory_json["ca_owner_name"]}`}
      ];
    case 'INTERESTS':
      targets_json = {filter_target: 'Interest', target_nicename: 'Interested in'};
      if (!subcategory_json) return [targets_json];
      return subcategory_json.map((interest) => ({...targets_json, filter_segment: interest.name}));
    case 'RELATIONSHIP_STATUS':
      targets_json = {filter_target: 'Relationship', target_nicename: 'Relationship status'};
      if (!subcategory_json) return [targets_json];
      return [
        {...targets_json, filter_segment: subcategory_json.relationship_status, segment_nicename: friendlyRelationshipStatus(subcategory_json.relationship_status)}
      ];
    case 'LOCATION':
      targets_json = {filter_target: "Location"};
      if (!subcategory_json) return [targets_json];
      return [{...targets_json, filter_segment: subcategory_json.location_name}]; // TODO: location type, location granularity
    case 'AGE_GENDER':
      if (!subcategory_json) return [{filter_target: 'Gender'}, {filter_target: 'MinAge', target_nicename: "Min Age"}, {filter_target: 'MaxAge', target_nicename: "Max Age"}];
      const res = [
        {filter_target: 'MinAge', target_nicename: "Min Age", filter_segment: subcategory_json["age_min"] + 12 }
      ];
      if (subcategory_json["age_max"] + 12 !== 65) // FB appears to treat 65 as "65 and older".
        res.push({filter_target: 'MaxAge', target_nicename: "Max Age", filter_segment:  subcategory_json["age_max"] + 12,  })
      if (subcategory_json["gender"] !== "ANY")
        res.push({filter_target: 'Gender', filter_segment:  subcategory_json["gender"], "segment_nicename": GENDER_CROSSWALK[subcategory_json["gender"]] });
      return res
    case 'WORK_EMPLOYERS':
      targets_json = {filter_target: "Employer"};
      if (!subcategory_json) return [targets_json];
      return [{...targets_json, filter_segment: subcategory_json.employer_name}];
    case 'WORK_JOB_TITLES':
      targets_json = {filter_target: "Job title"};
      if (!subcategory_json) return [targets_json];
      return [{...targets_json, filter_segment: subcategory_json.job_title}];
    case 'BCT':
      targets_json = {filter_target: 'BCT', target_nicename: "Behavioral Targeting"};
      if (!subcategory_json) return [targets_json];
      if (subcategory_json.name.match(/Likely engagement with US political content/)) {
        const match = subcategory_json.name
            .match(/(Likely engagement with US political content) \((.*)\)/)
        return [{...targets_json, filter_segment: subcategory_json.name, target_nicename: match[1], segment_nicename: match[2]}];
      }
      if (subcategory_json.name.match(/Household income/)) {
        const match = subcategory_json.name.match(/(Household income): (.*) \(/)
        return [{...targets_json, filter_segment: subcategory_json.name, target_nicename: match[1], segment_nicename: match[2]}];
      }
      if (
        [
          'African American (US)',
          'Hispanic (US - All)',
          'Asian American (US)',
          'Hispanic (US - Bilingual)',
          'Hispanic (US - English Dominant)',
          'Hispanic (US - Spanish Dominant)',
        ].indexOf(subcategory_json.name) > -1
      ) {
        return [{...targets_json, filter_segment: subcategory_json.name, target_nicename: "Multicultural affinity", segment_nicename: subcategory_json.name}];
      }
      return [{filter_target: 'Behavior', filter_segment: subcategory_json.name}];
    case 'CUSTOM_AUDIENCES_ENGAGEMENT_PAGE':
      return [{filter_target: 'Online behavior', filter_segment: 'visited a particular Facebook page'}];
    case 'CUSTOM_AUDIENCES_ENGAGEMENT_VIDEO':
      return [{filter_target: 'Online behavior', filter_segment: 'watched a particular video'}];
    case 'CUSTOM_AUDIENCES_ENGAGEMENT_IG':
      return [{filter_target: 'Online behavior', filter_segment: 'visited a particular Instagram page'}];
    case 'CUSTOM_AUDIENCES_WEBSITE':
      return [{filter_target: 'Online behavior', filter_segment: 'visited a particular website'}];
    case 'CUSTOM_AUDIENCES_MOBILE_APP':
      return [{filter_target: 'Online behavior', filter_segment: 'used a particular app'}];
    case 'CUSTOM_AUDIENCES_ENGAGEMENT_EVENT':
      return [{filter_target: 'Online behavior', filter_segment: 'engagement event'}];
    case 'CUSTOM_AUDIENCES_OFFLINE':
      return [{filter_target: 'Online behavior', filter_segment: 'offline data'}];
    case 'CUSTOM_AUDIENCES_STORE_VISITS':
      return [{filter_target: 'Online behavior', filter_segment: 'store visits'}];
    case 'CUSTOM_AUDIENCES_ENGAGEMENT_CANVAS':
      return [{filter_target: 'Online behavior', filter_segment: 'canvas engagement'}];
    case 'CUSTOM_AUDIENCES_ENGAGEMENT_LEAD_GEN':
      return [{filter_target: 'Online behavior', filter_segment: 'filled out a lead gen form'}];
    case 'CUSTOM_AUDIENCES_LOOKALIKE':
      // const audience_list_msg = friendlyAudienceListOwner(targeting["dfca_data"]["ca_owner_name"]); // TODO: lookalike audience uploader
      return [{filter_target: 'Similarity', filter_segment: 'Lookalike Audience'}];
    case 'DYNAMIC_RULE':
      targets_json = {filter_target: "Dynamic rule"};
      if (!subcategory_json) return [targets_json];
      return [{...targets_json, filter_segment: subcategory_json}];
    case 'ED_STATUS':
      targets_json = {filter_target: "Education status"};
      if (!subcategory_json) return [targets_json];
      const education_statuses = {
        EDU_MASTER_DEGREE: "Master's degree",
        EDU_DOCTORATE_DEGREE: 'Doctorate',
        EDU_COLLEGE_ALUMNUS: 'College degree',
        EDU_PROFESSIONAL_DEGREE: 'Professional degree',
      };
      return [
        [{...targets_json, segment_nicename: education_statuses[subcategory_json.edu_status] || subcategory_json.edu_status, filter_segment: subcategory_json.edu_status}],
      ];
    case 'EDU_SCHOOLS':
      targets_json = {filter_target: 'EDU_SCHOOLS', target_nicename: 'School'};
      if (!subcategory_json) return [targets_json];
      return subcategory_json.map((school_name) => ({...targets_json, filter_segment: school_name }));
    case 'LOCALE':
      targets_json = {filter_target: 'LOCALE', target_nicename: 'Speakers of'};
      if (!subcategory_json) return [targets_json];
      return subcategory_json.locales.replace("{", "").replace("}", "").split(",").map((locale) => ({...targets_json, filter_segment: locale}));
    case 'ACTIONABLE_INSIGHTS':
      targets_json = {filter_target: 'ACTIONABLE_INSIGHTS', target_nicename: 'Behavior'};
      if (!subcategory_json) return [targets_json];
      return [{...targets_json, filter_segment: subcategory_json.description}];
    case 'FRIENDS_OF_CONNECTION':
      targets_json = {filter_target: 'FRIENDS_OF_CONNECTION', target_nicename: 'Your friends like', };
      if (!subcategory_json) return [targets_json];
      return [{...targets_json, filter_segment: subcategory_json.name }];
    case 'CONNECTION':
      targets_json = {filter_target: 'CONNECTION', target_nicename: 'You like',};
      if (!subcategory_json) return [targets_json];
      return [{...targets_json, filter_segment: subcategory_json.name}];
    case 'COLLABORATIVE_AD':
      targets_json = {filter_target: waist_ui_type, target_nicename: 'Brand/Store Collaborative Ad',};
      if (!subcategory_json) return [targets_json];
      return [{...targets_json, filter_segment: subcategory_json.merchant_name}];    
    case 'COLLABORATIVE_ADS_STORE_SALES':
      targets_json = {filter_target: waist_ui_type, target_nicename: 'Brand/Store Collaborative Ad (Sales)',};
      if (!subcategory_json) return [targets_json];
      return [{...targets_json, filter_segment: subcategory_json.merchant_name}];    
    case 'COLLABORATIVE_ADS_STORE_VISITS':
      targets_json = {filter_target: waist_ui_type, target_nicename: 'Brand/Store Collaborative Ad (Visits)',};
      if (!subcategory_json) return [targets_json];
      return [{...targets_json, filter_segment: subcategory_json.merchant_name}];
    default:
      return [];
  }
};