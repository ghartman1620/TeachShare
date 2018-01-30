
<template>
  <v-app>

    <!-- navigation drawer operates independent of toolbar -->
    <v-navigation-drawer clipped fixed v-model="drawer" app dense>
      <v-list dense>
        <v-list-tile @click="">
          <v-list-tile-action>
            <v-icon>dashboard</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Dashboard</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile @click="">
          <v-list-tile-action>
            <v-icon>settings</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Settings</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>


    <!-- Main tooblar -->
    <v-toolbar color="blue" dense app fixed clipped-left>
      <v-toolbar-title style="width: 300px" class="ml-0 pl-3">

      <!-- this is the actual button to open the drawer -->
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>

        TeachShare
      </v-toolbar-title>

      <v-layout row align-center style="padding: 20px;max-width: 300px;">
      <v-text-field
          placeholder="Search..."
          single-line
          append-icon="search"
          :append-icon-cb="() => {}"
          class="white--text"
          hide-details
        ></v-text-field>

        </v-layout>
         <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn flat>Link One</v-btn>
          <v-btn flat>Link Two</v-btn>
          <v-btn flat>Link Three</v-btn>
        </v-toolbar-items>
        <v-menu :nudge-width="100">
        <v-toolbar-title slot="activator">
          <span>All</span>
          <v-icon dark>arrow_drop_down</v-icon>
        </v-toolbar-title>
        <v-list>
          <v-list-tile v-for="item in items" :key="item" @click="">
            <v-list-tile-title v-text="item"></v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>

      <v-btn icon>
        <v-icon>search</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>favorite</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>more_vert</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <v-flex xs10 offset-xs1>
      <v-jumbotron color="grey lighten-2">
          <v-container fill-height>
            <v-layout align-center>
              <v-flex>
                <h3 class="display-3">Welcome to the site</h3>
                <span class="subheading">Lorem ipsum dolor sit amet, pri veniam forensibus id. Vis maluisset molestiae id, ad semper lobortis cum. At impetus detraxit incorrupte usu, repudiare assueverit ex eum, ne nam essent vocent admodum.</span>
                <v-divider class="my-3"></v-divider>
                <div class="title mb-3">Check out our newest features!</div>
                <v-btn large color="primary" class="mx-0">See more</v-btn>
              </v-flex>
            </v-layout>
          </v-container>
        </v-jumbotron>
      <v-container fluid fill-height>

        <v-flex xs7 offset-xs2>
          <v-form v-model="valid" ref="form" lazy-validation>
            <v-text-field
              label="Name"
              v-model="name"
              :rules="nameRules"
              :counter="30"
              required
            ></v-text-field>
            <v-text-field
              label="E-mail"
              v-model="email"
              :rules="emailRules"
              :counter="100"
              required
            ></v-text-field>
            <v-select
              label="Item"
              v-model="select"
              :items="items"
              :rules="[v => !!v || 'Item is required']"
              autocomplete
              required
            ></v-select>
            <v-checkbox
              label="Do you agree?"
              v-model="checkbox"
              :rules="[v => !!v || 'You must agree to continue!']"
              required
            ></v-checkbox>

            <v-btn
              @click="submit"
              :disabled="!valid"
            >
              submit
            </v-btn>
            <v-btn @click="clear">clear</v-btn>
          </v-form>
          </v-flex>
        </v-layout>
      </v-container>
      </v-flex>
    </v-content>
    <v-footer app fixed>
      <span>&copy; 2017</span>
    </v-footer>
  </v-app>
</template>

<script>
  export default {
    data: () => ({
      drawer: true,
      valid: true,
      name: '',
      nameRules: [
        v => !!v || 'Name is required',
        v => (v && v.length <= 10) || 'Name must be less than 10 characters'
      ],
      email: '',
      emailRules: [
        v => !!v || 'E-mail is required',
        v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid'
      ],
      select: null,
      items: [
        'Item 1',
        'Item 2',
        'Item 3',
        'Item 4'
      ],
      checkbox: false
    }),
    props: {
      source: String
    },
    methods: {
      submit () {
        if (this.$refs.form.validate()) {
          // do something
          console.log(this.$refs.form)

        }
      },
      clear () {
        this.$refs.form.reset()
      }
    }
  }
</script>
