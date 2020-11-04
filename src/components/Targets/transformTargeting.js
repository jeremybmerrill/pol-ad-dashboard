const friendlyAudienceListOwner = (ca_owner_name) => {
  return ca_owner_name ? `on a list uploaded by ${ca_owner_name}` : '';
};

const friendlyCustomAudiencesInfo = (subcategory_data) => {
  const match_key_friendly_names = {
    email: 'email address',
    phone: 'phone number',
  };
  let match_keys = null;
  let audience_list_owner = null;
  if (subcategory_data) {
    audience_list_owner = friendlyAudienceListOwner(
      subcategory_data.ca_owner_name,
    );
    if (subcategory_data.match_keys) {
      match_keys = subcategory_data.match_keys
        .filter((match_key) => match_key)
        .map((match_key) => match_key_friendly_names[match_key])
        .join(' and/or ');
    // } else {
    //   match_keys = subcategory_data
    //     .map((match_key) => match_key_friendly_names[match_key])
    //     .join(' and/or ');
    }
  }
  return [
    match_keys ? `people specified by ${match_keys}` : '',
    audience_list_owner,
  ]
    .filter((x) => x)
    .join(', ');
};

const friendlyRelationshipStatus = (subcategory) => {
  const relationship_status = {
    4: 'Married',
    0: 'Unspecified',
    5: 'Engaged',
    1: 'Single',
  };
  try {
    const subcategory_data = JSON.parse(subcategory);
    return (
      relationship_status[subcategory_data.relationship_status] || subcategory
    );
  } catch (e) {
    console.log('Unable to parse targeting subcategory');
    return subcategory;
  }
};

/*
    I sing of ads and a person. Who, from Facebook's databases,
    seeking their fate, came to the ad collector's shores.

*/
export const friendlifyTargeting = (category, subcategory_json) => {
  switch (category) {
    case 'CUSTOM_AUDIENCES_DATAFILE':
      return [
        ['List of specific people', friendlyCustomAudiencesInfo(subcategory_json)],
      ];
    case 'INTERESTS':
      const interests = subcategory_json;
      return subcategory_json.map((interest) => ['Interested in', interest.name]);
    case 'RELATIONSHIP_STATUS':
      return [
        ['Relationship status:', friendlyRelationshipStatus(subcategory_json)],
      ];
    case 'WORK_EMPLOYERS':
      return [['Employer', subcategory_json]];
    case 'WORK_JOB_TITLES':
      return [['Job title', subcategory_json]];
    case 'BCT':
      if (subcategory_json.match(/Likely engagement with US political content/)) {
        return [
          subcategory_json
            .match(/(Likely engagement with US political content) \((.*)\)/)
            .slice(1, 3),
        ];
      }
      if (subcategory_json.match(/Household income/)) {
        return [subcategory_json.match(/(Household income): (.*) \(/).slice(1, 3)];
      }
      if (
        [
          'African American (US)',
          'Hispanic (US - All)',
          'Asian American (US)',
          'Hispanic (US - Bilingual)',
          'Hispanic (US - English Dominant)',
          'Hispanic (US - Spanish Dominant)',
        ].indexOf(subcategory_json) > -1
      ) {
        return [['Multicultural affinity', subcategory_json]];
      }
      return [['Behavior', subcategory_json]];
    case 'LOCATION':
      let kind;
      try {
        kind = subcategory_json.match(/\((.*)\)/)[1];
      } catch (TypeError) {
        kind = null;
      }
      const kinds = {
        HOME: 'home is in ',
        CURRENT: 'currently in ',
        null: '',
      };
      return [['Location', kinds[kind] + subcategory_json["location_name"]]];
    case 'CUSTOM_AUDIENCES_ENGAGEMENT_PAGE':
      return [['Online behavior', 'visited a particular Facebook page']];
    case 'CUSTOM_AUDIENCES_ENGAGEMENT_VIDEO':
      return [['Online behavior', 'watched a particular video']];
    case 'CUSTOM_AUDIENCES_ENGAGEMENT_IG':
      return [['Online behavior', 'visited a particular Instagram page']];
    case 'CUSTOM_AUDIENCES_WEBSITE':
      return [['Online behavior', 'visited a particular website']];
    case 'CUSTOM_AUDIENCES_MOBILE_APP':
      return [['Online behavior', 'used a particular app']];
    case 'CUSTOM_AUDIENCES_LOOKALIKE':
      const audience_list_msg = friendlyAudienceListOwner(subcategory_json.ca_owner_name);
      return [
        ['Similarity', `resemble people ${audience_list_msg || 'on a list'}`],
      ];
    case 'DYNAMIC_RULE':
      return [['Dynamic rule', subcategory_json]];
    case 'ED_STATUS':
      const education_statuses = {
        EDU_MASTER_DEGREE: "Master's degree",
        EDU_DOCTORATE_DEGREE: 'Doctorate',
        EDU_COLLEGE_ALUMNUS: 'College degree',
        EDU_PROFESSIONAL_DEGREE: 'Professional degree',
      };
      return [
        ['Education status', education_statuses[subcategory_json] || subcategory_json],
      ];
    case 'EDU_SCHOOLS':
      return [['School', subcategory_json]];
    case 'AGE_GENDER':
      const res = [
        [
          'Age',
          `${subcategory_json["age_min"]} to ${subcategory_json["age_max"]}`
        ],
        [
          'MaxAge',
          `${subcategory_json["age_max"]}`
        ],
        [
          'MinAge',
          `${subcategory_json["age_min"]}`
        ],
      ];
      if (subcategory_json["gender"] != "ANY")
        res.push(['Gender', subcategory_json["gender"]]);
      return res
    case 'LOCALES':
      return [['Speakers of', subcategory_json]];
    case 'ACTIONABLE_INSIGHTS':
      return [['Behavior', subcategory_json]];
    case 'FRIENDS_OF_CONNECTION':
      return [['Your friends like', subcategory_json]];
    case 'CONNECTION':
      return [['You like', subcategory_json]];
    default:
      return [];
  }
};

export const VERY_SKETCHY = 1;
export const MILDLY_SKETCHY = 2;
export const NOT_SKETCHY = 3;

const sketchiness = {
  CUSTOM_AUDIENCES_DATAFILE: VERY_SKETCHY,
  INTERESTS: VERY_SKETCHY,
  RELATIONSHIP_STATUS: VERY_SKETCHY,
  WORK_EMPLOYERS: VERY_SKETCHY,
  WORK_JOB_TITLES: VERY_SKETCHY,
  BCT: VERY_SKETCHY,
  LOCATION: MILDLY_SKETCHY,
  CUSTOM_AUDIENCES_ENGAGEMENT_PAGE: MILDLY_SKETCHY,
  CUSTOM_AUDIENCES_ENGAGEMENT_VIDEO: MILDLY_SKETCHY,
  CUSTOM_AUDIENCES_ENGAGEMENT_IG: MILDLY_SKETCHY,
  CUSTOM_AUDIENCES_WEBSITE: MILDLY_SKETCHY,
  CUSTOM_AUDIENCES_MOBILE_APP: MILDLY_SKETCHY,
  CUSTOM_AUDIENCES_LOOKALIKE: MILDLY_SKETCHY,
  DYNAMIC_RULE: MILDLY_SKETCHY,
  ED_STATUS: MILDLY_SKETCHY,
  EDU_SCHOOLS: MILDLY_SKETCHY,
  AGE_GENDER: NOT_SKETCHY,
  LOCALES: NOT_SKETCHY,
  ACTIONABLE_INSIGHTS: NOT_SKETCHY,
  FRIENDS_OF_CONNECTION: NOT_SKETCHY,
  CONNECTION: NOT_SKETCHY,
};

export const transformTargetingLine = (
  acc,
  { category, subcategory, count },
) => {
  return acc.concat(
    friendlifyTargeting(category, subcategory).map(([cat, subcat]) => {
      return {
        category: cat,
        subcategory: subcat,
        count,
        sketchiness: sketchiness[category],
      };
    }),
  );
};

export default transformTargetingLine;
