<template>
  <div id="manage-lists">
    <small-header></small-header>
    <div v-if="loadingPage" class="container">
      <div class="row mt-5">
        <div class="col d-flex justify-content-center">
          <div class="spinner-border text-secondary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!loadingPage" class="container main-container">
      <div class="row">
        <div class="col">
          <button type="button" class="btn btn-light my-3" @click="$router.push('/profile')">
            <span class="oi oi-chevron-left oi-icon menu-icon" title="oi-chevron-left"></span>
            Back
          </button>
        </div>
      </div>
      <div class="row">
          <div class="col-7">
              <h5>
                  My subscriptions
              </h5>
          </div>
          <div class="col">
            <div v-if="updatingUserSubs" class="updating-spinner spinner-border spinner-border-sm text-secondary float-right" role="status">
              <span class="sr-only">Loading...</span>
            </div>
            <p v-if="userSubsUpdated" class="updated-flag mb-0 float-right">Updated!</p>
          </div>
      </div>
      <div class="row">
          <div class="col-12">
            <div class="card shadow-sm text-center" v-if="userData['lists'].length === 0">
                <div class="card-body no-subs-card">
                    <div class="row list-row">
                        <div class="col">
                            <h6 class="card-text">No lists here!</h6>
                            <p class="card-text">Subscribe to a new list below.</p>
                        </div>
                    </div>
                </div>
            </div>
              <div class="card shadow-sm" v-for="(value, key) in userData['lists']" :key=key>
                  <div class="card-body">
                      <div class="row list-row">
                          <div class="col">
                            <h6 class="card-text">{{ value['list_name'] }}, {{ value['character_set'] }}</h6>
                          </div>
                          <div class="col">
                            <button type="button" class="btn btn-outline-secondary list-btn float-right" @click="unsubscribe(value)">Unsubscribe</button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      <hr/>
      <div class="row">
          <div class="col">
              <h5>
                  Find new lists
              </h5>
          </div>
          <div class="col">
              <div class="dropdown float-right">
                  <button v-if="!resultsFiltered" class="btn btn-light filter-btn dropdown-toggle" @click="showDropdown = !showDropdown" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      Filter
                  </button>
                  <button v-if="resultsFiltered" class="btn btn-light filter-btn" @click="clearResultsFilter()" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      {{ filterResultsValue }}
                      <span v-if="resultsFiltered" class="oi oi-x"></span>
                  </button>
                  <div v-if="!resultsFiltered" class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" :class="{'dropdown-open': showDropdown}">
                      <a class="dropdown-item" href="#" @click.prevent="filterResults('Simplified')">Simplified</a>
                      <a class="dropdown-item" href="#" @click.prevent="filterResults('Traditional')">Traditional</a>
                  </div>
              </div>
          </div>
      </div>
      <div class="row">
          <div class="col-12 list-display">
              <div class="card shadow-sm" v-for="(value, key) in allAvailableLists" :key=key>
                  <div class="card-body">
                      <div class="row list-row">
                          <div class="col">
                            <h6 class="card-text">{{ value['list_name'] }}, {{ value['character_set'] }}</h6>
                          </div>
                          <div class="col">
                            <button type="button" class="btn btn-outline-orange list-btn float-right" @click="subscribe(value)">Subscribe</button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
    <custom-footer :footerWidth="footerWidth"></custom-footer>
  </div>
</template>

<script>
import smallHeader from '@/components/smallHeader.vue'
import customFooter from '@/components/footer.vue'
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js'
import shared from './../shared'

export default {
  name: 'manage-lists',
  components: {
    'small-header': smallHeader,
    'custom-footer': customFooter
  },
  data () {
    return {
      loadingPage: true,
      showDropdown: false,
      unsubSelected: false,
      updatingUserSubs: false,
      userSubsUpdated: false,
      changesMade: false,
      resultsFiltered: false,
      filterResultsValue: null,
      userData: {},
      // Temporarily hardcoding lists until list storage is moved to DyanmoDB
      allLists: [
        {
          'list_name': 'HSK Level 1',
          'list_id': '1ebcad3f-5dfd-6bfe-bda4-acde48001122',
          'unique_id': '1ebcad3f-5dfd-6bfe-bda4-acde48001122simplified',
          'character_set': 'simplified',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 2',
          'list_id': '1ebcad3f-adc0-6f42-b8b1-acde48001122',
          'unique_id': '1ebcad3f-adc0-6f42-b8b1-acde48001122simplified',
          'character_set': 'simplified',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 3',
          'list_id': '1ebcad3f-f815-6b92-b3e8-acde48001122',
          'unique_id': '1ebcad3f-f815-6b92-b3e8-acde48001122simplified',
          'character_set': 'simplified',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 4',
          'list_id': '1ebcad40-414f-6bc8-859d-acde48001122',
          'unique_id': '1ebcad40-414f-6bc8-859d-acde48001122simplified',
          'character_set': 'simplified',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 5',
          'list_id': '1ebcad40-bb9e-6ece-a366-acde48001122',
          'unique_id': '1ebcad40-bb9e-6ece-a366-acde48001122simplified',
          'character_set': 'simplified',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 6',
          'list_id': '1ebcad41-197a-6700-95a3-acde48001122',
          'unique_id': '1ebcad41-197a-6700-95a3-acde48001122simplified',
          'character_set': 'simplified',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 1',
          'list_id': '1ebcad3f-5dfd-6bfe-bda4-acde48001122',
          'unique_id': '1ebcad3f-5dfd-6bfe-bda4-acde48001122traditional',
          'character_set': 'traditional',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 2',
          'list_id': '1ebcad3f-adc0-6f42-b8b1-acde48001122',
          'unique_id': '1ebcad3f-adc0-6f42-b8b1-acde48001122traditional',
          'character_set': 'traditional',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 3',
          'list_id': '1ebcad3f-f815-6b92-b3e8-acde48001122',
          'unique_id': '1ebcad3f-f815-6b92-b3e8-acde48001122traditional',
          'character_set': 'traditional',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 4',
          'list_id': '1ebcad40-414f-6bc8-859d-acde48001122',
          'unique_id': '1ebcad40-414f-6bc8-859d-acde48001122traditional',
          'character_set': 'traditional',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 5',
          'list_id': '1ebcad40-bb9e-6ece-a366-acde48001122',
          'unique_id': '1ebcad40-bb9e-6ece-a366-acde48001122traditional',
          'character_set': 'traditional',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 6',
          'list_id': '1ebcad41-197a-6700-95a3-acde48001122',
          'unique_id': '1ebcad41-197a-6700-95a3-acde48001122traditional',
          'character_set': 'traditional',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        }
      ],
      footerWidth: 'narrow'
    }
  },
  created () {
    this.getUserData = shared.getUserData
  },
  async mounted () {
    try {
      this.userData = await this.getUserData()
    } catch (error) {
      console.log('Error retrieving user data')
    }
    console.log('all lists', this.allAvailableLists)
    this.loadingPage = false
  },
  computed: {
    subscribedListIds () {
      // generate unique id
      return this.userData['lists'].map(elem => elem['list_id'] + elem['character_set'])
    },
    allAvailableLists () {
      // return this.allLists.filter(e => this.subscribedListIds.indexOf(e['list_id']) === -1)
      if (this.resultsFiltered === true) {
        console.log('lists ', this.filterResultsValue)
        let filteredLists = this.allLists.filter((elem) => {
          return elem['character_set'] === this.filterResultsValue.toLowerCase()
        })
        return filteredLists.filter(elem => !this.subscribedListIds.includes(elem['unique_id']))
      }
      return this.allLists.filter(elem => !this.subscribedListIds.includes(elem['unique_id']))
    }
  },
  methods: {
    toggleSelect (listId) {
    },
    filterResults (value) {
      console.log('filter results ', value)
      this.showDropdown = !this.showDropdown
      this.filterResultsValue = value
      this.resultsFiltered = true
      console.log('filter results ', value)
    },
    clearResultsFilter () {
      console.log('clear filter')
      this.resultsFiltered = false
      this.filterResultsValue = null
    },
    subscribe (list) {
      this.userData['lists'].push(
        {
          'character_set': list['character_set'],
          'list_id': list['list_id'],
          'list_name': list['list_name']
        }
      )
      console.log('sub', this.userData['lists'])
      this.setUserSubscriptions()
    },
    unsubscribe (list) {
      console.log('unsubscribe ', list['list_name'])
      for (let i = 0; i < this.userData['lists'].length; i++) {
        if (list['unique_id'] === this.userData['lists'][i]['unique_id']) {
          this.userData['lists'].splice(i, 1)
        }
      }
      console.log('unsub', this.userData['lists'])
      this.setUserSubscriptions()
    },
    setUserSubscriptions () {
      this.updatingUserSubs = true
      this.userSubsUpdated = false
      let requestBody = {
        'cognito_id': this.userData['user_data']['user_id'],
        'email': this.userData['user_data']['email_address'],
        'character_set_preference': this.userData['user_data']['character_set_preference'],
        'lists': this.userData['lists']
      }
      console.log(requestBody.lists)
      let userPoolData = {
        UserPoolId: process.env.VUE_APP_USER_POOL_ID,
        ClientId: process.env.VUE_APP_USER_POOL_WEB_CLIENT_ID,
        Storage: localStorage
      }
      let userPool = new AmazonCognitoIdentity.CognitoUserPool(userPoolData)
      let cognitoUser = userPool.getCurrentUser()
      if (cognitoUser != null) {
        cognitoUser.getSession((err, session) => {
          if (err) {
            console.log(err)
          } else if (!session.isValid()) {
            console.log('Invalid session.')
          } else {
            console.log('IdToken: ' + session.getIdToken().getJwtToken())
            return axios
              .post(process.env.VUE_APP_API_URL + 'set_subs',
                requestBody,
                {
                  headers: {
                    'Authorization': session.getIdToken().getJwtToken()
                  }
                })
              .then((response) => {
                console.log(response.data)
                this.updatingUserSubs = false
                this.userSubsUpdated = true
              })
          }
        })
      } else {
        console.log('User not found.')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@media only screen and (min-width: 500px) {
  .main-container {
    max-width: 55rem;
    padding: 1rem 15px;
  }
}
.main-container {
  padding-bottom: 6rem;
}
.dropdown-open {
  display: block;
}
.dropdown-menu {
  min-width: auto;
}
.updated-flag {
  color: orangered
}
.updating-spinner {
  margin: 0rem 1rem;
}
.card-body {
  padding: 0.5rem 1rem;
}
.list-display{
  height: 350px;
  overflow-y: scroll;
  display: block;
}
.list-row {
  align-items: center;
}
.list-btn {
  min-width: 120px;
}
.btn-outline-orange {
  border-color: #fe4c00;
  color: #fe4c00;
}
.no-subs-card {
  padding: 1rem 0.5rem;
}
.filter-btn {
  min-width: 100px;
}
</style>
