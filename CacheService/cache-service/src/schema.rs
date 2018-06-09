table! {
    accounts_gradetaught (id) {
        id -> Int4,
        grade -> Varchar,
        userProfile_id -> Int4,
    }
}

table! {
    accounts_subjecttaught (id) {
        id -> Int4,
        subject -> Varchar,
        userProfile_id -> Int4,
    }
}

table! {
    accounts_userprofile (user_id) {
        user_id -> Int4,
        schoolDistrict -> Varchar,
    }
}

table! {
    auth_group (id) {
        id -> Int4,
        name -> Varchar,
    }
}

table! {
    auth_group_permissions (id) {
        id -> Int4,
        group_id -> Int4,
        permission_id -> Int4,
    }
}

table! {
    auth_permission (id) {
        id -> Int4,
        name -> Varchar,
        content_type_id -> Int4,
        codename -> Varchar,
    }
}

table! {
    auth_user (id) {
        id -> Int4,
        // password -> Varchar,
        last_login -> Nullable<Timestamptz>,
        is_superuser -> Bool,
        username -> Varchar,
        first_name -> Varchar,
        last_name -> Varchar,
        email -> Varchar,
        is_staff -> Bool,
        is_active -> Bool,
        date_joined -> Timestamptz,
    }
}

table! {
    auth_user_groups (id) {
        id -> Int4,
        user_id -> Int4,
        group_id -> Int4,
    }
}

table! {
    auth_user_user_permissions (id) {
        id -> Int4,
        user_id -> Int4,
        permission_id -> Int4,
    }
}

table! {
    django_admin_log (id) {
        id -> Int4,
        action_time -> Timestamptz,
        object_id -> Nullable<Text>,
        object_repr -> Varchar,
        action_flag -> Int2,
        change_message -> Text,
        content_type_id -> Nullable<Int4>,
        user_id -> Int4,
    }
}

table! {
    django_content_type (id) {
        id -> Int4,
        app_label -> Varchar,
        model -> Varchar,
    }
}

table! {
    django_migrations (id) {
        id -> Int4,
        app -> Varchar,
        name -> Varchar,
        applied -> Timestamptz,
    }
}

table! {
    django_session (session_key) {
        session_key -> Varchar,
        session_data -> Text,
        expire_date -> Timestamptz,
    }
}

table! {
    guardian_groupobjectpermission (id) {
        id -> Int4,
        object_pk -> Varchar,
        content_type_id -> Int4,
        group_id -> Int4,
        permission_id -> Int4,
    }
}

table! {
    guardian_userobjectpermission (id) {
        id -> Int4,
        object_pk -> Varchar,
        content_type_id -> Int4,
        permission_id -> Int4,
        user_id -> Int4,
    }
}

table! {
    oauth2_provider_accesstoken (id) {
        id -> Int8,
        token -> Varchar,
        expires -> Timestamptz,
        scope -> Text,
        application_id -> Nullable<Int8>,
        user_id -> Nullable<Int4>,
        created -> Timestamptz,
        updated -> Timestamptz,
    }
}

table! {
    oauth2_provider_application (id) {
        id -> Int8,
        client_id -> Varchar,
        redirect_uris -> Text,
        client_type -> Varchar,
        authorization_grant_type -> Varchar,
        client_secret -> Varchar,
        name -> Varchar,
        user_id -> Nullable<Int4>,
        skip_authorization -> Bool,
        created -> Timestamptz,
        updated -> Timestamptz,
    }
}

table! {
    oauth2_provider_grant (id) {
        id -> Int8,
        code -> Varchar,
        expires -> Timestamptz,
        redirect_uri -> Varchar,
        scope -> Text,
        application_id -> Int8,
        user_id -> Int4,
        created -> Timestamptz,
        updated -> Timestamptz,
    }
}

table! {
    oauth2_provider_refreshtoken (id) {
        id -> Int8,
        token -> Varchar,
        access_token_id -> Int8,
        application_id -> Int8,
        user_id -> Int4,
        created -> Timestamptz,
        updated -> Timestamptz,
    }
}

table! {
    posts_attachment (id) {
        id -> Int4,
        file -> Nullable<Varchar>,
        last_updated -> Timestamptz,
        post_id -> Nullable<Int4>,
    }
}

table! {
    posts_comment (id) {
        id -> Int4,
        text -> Text,
        timestamp -> Timestamptz,
        post_id -> Int4,
        user_id -> Int4,
    }
}

table! {
    posts_post (id) {
        id -> Int4,
        title -> Varchar,
        content -> Jsonb,
        // updated -> Timestamptz,
        likes -> Int4,
        // timestamp -> Timestamptz,
        tags -> Jsonb,
        user_id -> Int4,
        draft -> Bool,
        content_type -> Int4,
        grade -> Int4,
        // length -> Interval,
        subject -> Int4,
        crosscutting_concepts -> Array<Int4>,
        disciplinary_core_ideas -> Array<Int4>,
        practices -> Array<Int4>,

        // added these ones manually...
        color -> Varchar,
        layout -> Jsonb,
        original_user_id -> Nullable<Int4>,

        // id -> Int4,
        // practices -> Array<Int4>,
        // crosscutting_concepts -> Array<Int4>,
        // disciplinary_core_ideas -> Array<Int4>,
        // color -> Varchar,
        // layout -> Jsonb,
        // title -> Varchar,
        // content -> Jsonb,
        // // updated -> Timestamptz,
        // likes -> Int4,
        // draft -> Bool,
        // // timestamp -> Timestamptz,
        // tags -> Jsonb,
        // grade -> Int4,
        // subject -> Int4,
        // // length -> Interval,
        // content_type -> Int4,
        // original_user_id -> Nullable<Int4>,
        // user_id -> Int4,
    }
}

table! {
    posts_post_standards (id) {
        id -> Int4,
        post_id -> Int4,
        standard_id -> Int4,
    }
}

table! {
    posts_standard (id) {
        id -> Int4,
        name -> Varchar,
        code -> Varchar,
        category -> Varchar,
        grade -> Int4,
        description -> Text,
        subject -> Int4,
    }
}

table! {
    social_auth_association (id) {
        id -> Int4,
        server_url -> Varchar,
        handle -> Varchar,
        secret -> Varchar,
        issued -> Int4,
        lifetime -> Int4,
        assoc_type -> Varchar,
    }
}

table! {
    social_auth_code (id) {
        id -> Int4,
        email -> Varchar,
        code -> Varchar,
        verified -> Bool,
        timestamp -> Timestamptz,
    }
}

table! {
    social_auth_nonce (id) {
        id -> Int4,
        server_url -> Varchar,
        timestamp -> Int4,
        salt -> Varchar,
    }
}

table! {
    social_auth_partial (id) {
        id -> Int4,
        token -> Varchar,
        next_step -> Int2,
        backend -> Varchar,
        data -> Text,
        timestamp -> Timestamptz,
    }
}

table! {
    social_auth_usersocialauth (id) {
        id -> Int4,
        provider -> Varchar,
        uid -> Varchar,
        extra_data -> Text,
        user_id -> Int4,
    }
}

joinable!(accounts_gradetaught -> accounts_userprofile (userProfile_id));
joinable!(accounts_subjecttaught -> accounts_userprofile (userProfile_id));
joinable!(accounts_userprofile -> auth_user (user_id));
joinable!(auth_group_permissions -> auth_group (group_id));
joinable!(auth_group_permissions -> auth_permission (permission_id));
joinable!(auth_permission -> django_content_type (content_type_id));
joinable!(auth_user_groups -> auth_group (group_id));
joinable!(auth_user_groups -> auth_user (user_id));
joinable!(auth_user_user_permissions -> auth_permission (permission_id));
joinable!(auth_user_user_permissions -> auth_user (user_id));
joinable!(django_admin_log -> auth_user (user_id));
joinable!(django_admin_log -> django_content_type (content_type_id));
joinable!(guardian_groupobjectpermission -> auth_group (group_id));
joinable!(guardian_groupobjectpermission -> auth_permission (permission_id));
joinable!(guardian_groupobjectpermission -> django_content_type (content_type_id));
// joinable!(guardian_userobjectpermission -> posts_post(object_pk));
joinable!(guardian_userobjectpermission -> auth_permission (permission_id));
joinable!(guardian_userobjectpermission -> auth_user (user_id));
joinable!(guardian_userobjectpermission -> django_content_type (content_type_id));
joinable!(oauth2_provider_accesstoken -> auth_user (user_id));
joinable!(oauth2_provider_accesstoken -> oauth2_provider_application (application_id));
joinable!(oauth2_provider_application -> auth_user (user_id));
joinable!(oauth2_provider_grant -> auth_user (user_id));
joinable!(oauth2_provider_grant -> oauth2_provider_application (application_id));
joinable!(oauth2_provider_refreshtoken -> auth_user (user_id));
joinable!(oauth2_provider_refreshtoken -> oauth2_provider_accesstoken (access_token_id));
joinable!(oauth2_provider_refreshtoken -> oauth2_provider_application (application_id));
joinable!(posts_attachment -> posts_post (post_id));
joinable!(posts_comment -> auth_user (user_id));
joinable!(posts_comment -> posts_post (post_id));
joinable!(posts_post_standards -> posts_post (post_id));
joinable!(posts_post_standards -> posts_standard (standard_id));
joinable!(social_auth_usersocialauth -> auth_user (user_id));

allow_tables_to_appear_in_same_query!(
    accounts_gradetaught,
    accounts_subjecttaught,
    accounts_userprofile,
    auth_group,
    auth_group_permissions,
    auth_permission,
    auth_user,
    auth_user_groups,
    auth_user_user_permissions,
    django_admin_log,
    django_content_type,
    django_migrations,
    django_session,
    guardian_groupobjectpermission,
    guardian_userobjectpermission,
    oauth2_provider_accesstoken,
    oauth2_provider_application,
    oauth2_provider_grant,
    oauth2_provider_refreshtoken,
    posts_attachment,
    posts_comment,
    posts_post,
    posts_post_standards,
    posts_standard,
    social_auth_association,
    social_auth_code,
    social_auth_nonce,
    social_auth_partial,
    social_auth_usersocialauth,
);
