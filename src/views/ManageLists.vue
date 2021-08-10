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
    <div v-if="!loadingPage" class="container">
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
      </div>
      <div class="row">
          <div class="col-12" v-for="(value, key) in userData['lists']" :key=key>
              <div class="card shadow-sm text-center">
                  <div class="card-body">
                      <div class="row">
                          <div class="col-6">
                              <h6 class="card-text">{{ value['list_name'] }}</h6>
                              <p class="card-text">{{ value['character_set'] }}</p>
                          </div>
                          <div class="col-6">
                              <button type="button" class="btn btn-outline-danger" :click="unsubscribe(value, character_set)">Unsubscribe</button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      <div class="row bg-light">
          <div class="col">
              <h5>
                  Find new lists
              </h5>
          </div>
          <div class="col">
              <div class="dropdown">
                  <button class="btn btn-secondary dropdown-toggle" @click="showDropdown = !showDropdown" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      Filter
                  </button>
                  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton" :class="{'dropdown-open': showDropdown}">
                      <a class="dropdown-item" href="#">Simplified</a>
                      <a class="dropdown-item" href="#">Traditional</a>
                  </div>
              </div>
          </div>
      </div>
      <div class="row bg-light">
          <div class="col-12 list-display">
              <div class="card shadow-sm text-center" v-for="(value, key) in allAvailableLists" :key=key>
                  <div class="card-body">
                      <div class="row">
                          <div class="col-6">
                              <h6 class="card-text">{{ value['list_name'] }}</h6>
                              <p class="card-text">{{ value['character_set'] }}</p>
                          </div>
                          <div class="col-6">
                              <button type="button" class="btn btn-outline-success" :click="subscribe(value, character_set)">Subscribe</button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
    <custom-footer></custom-footer>
  </div>
</template>

<script>
import smallHeader from '@/components/smallHeader.vue'
import customFooter from '@/components/footer.vue'
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js'

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
      changesMade: false,
      userData: {},
      // Temporarily hardcoding lists until list storage is moved to DyanmoDB
      allLists: [
        {
          'list_name': 'HSK Level 1',
          'list_id': '1ebcad3f-5dfd-6bfe-bda4-acde48001122',
          'character_set': 'simplified',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 2',
          'list_id': '1ebcad3f-adc0-6f42-b8b1-acde48001122',
          'character_set': 'simplified',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 3',
          'list_id': '1ebcad3f-f815-6b92-b3e8-acde48001122',
          'character_set': 'simplified',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 4',
          'list_id': '1ebcad40-414f-6bc8-859d-acde48001122',
          'character_set': 'simplified',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 5',
          'list_id': '1ebcad40-bb9e-6ece-a366-acde48001122',
          'character_set': 'simplified',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 6',
          'list_id': '1ebcad41-197a-6700-95a3-acde48001122',
          'character_set': 'simplified',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 1',
          'list_id': 'd685b31a-e161-11eb-ba80-0242ac130004',
          'character_set': 'traditional',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 2',
          'list_id': 'dbe24166-e161-11eb-ba80-0242ac130004',
          'character_set': 'traditional',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 3',
          'list_id': 'e0333b8a-e161-11eb-ba80-0242ac130004',
          'character_set': 'traditional',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 4',
          'list_id': 'e51bad3a-e161-11eb-ba80-0242ac130004',
          'character_set': 'traditional',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 5',
          'list_id': 'e9681f72-e161-11eb-ba80-0242ac130004',
          'character_set': 'traditional',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 6',
          'list_id': 'edf5677a-e161-11eb-ba80-0242ac130004',
          'character_set': 'traditional',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        }
      ]
    }
  },
  async mounted () {
    await this.getUserData()
    console.log('all lists', this.allAvailableLists)
    this.loadingPage = false
  },
  computed: {
    subscribedListIds () {
      return this.userData['lists'].map(elem => elem['list_id'])
    },
    allAvailableLists () {
      // return this.allLists.filter(e => this.subscribedListIds.indexOf(e['list_id']) === -1)
      return this.allLists.filter(elem => !this.subscribedListIds.includes(elem['list_id']))
    }
  },
  methods: {
    toggleSelect (listId) {
    },
    async getUserData () {
      let userPoolData = {
        UserPoolId: process.env.VUE_APP_USER_POOL_ID,
        ClientId: process.env.VUE_APP_USER_POOL_WEB_CLIENT_ID,
        Storage: localStorage
      }
      let userPool = new AmazonCognitoIdentity.CognitoUserPool(userPoolData)
      let cognitoUser = userPool.getCurrentUser()
      return new Promise((resolve, reject) => {
        if (cognitoUser != null) {
          cognitoUser.getSession((err, session) => {
            if (err) {
              console.log(err)
              reject(err)
            } else if (!session.isValid()) {
              console.log('Invalid session.')
              reject(Error('Invalid session.'))
            } else {
              console.log('IdToken: ' + session.getIdToken().getJwtToken())
              return axios
                .get(process.env.VUE_APP_API_URL + 'user_data', {
                  headers: {
                    'Authorization': session.getIdToken().getJwtToken()
                  }
                }
                )
                .then((response) => {
                  console.log(response.data)
                  this.userData = response.data
                  resolve(this.userData)
                })
            }
          })
        } else {
          console.log('User not found.')
          reject(Error('User not found.'))
        }
      })
    },
    subscribeList (list, character_set) {
      this.userData['user_data']['lists'].push(
        {
          'character_set': character_set,
          'list_id': list['list_id'],
          'list_name': list['list_name']
        }
      )
      setUserSubscriptions(this.userData['user_data']['lists'])
    },
    unsubscribeList (list, character_set) {
      for (let i = 0; i < this.userData['lists'].length; i++) {
        // check if list in subscribed
      }
      setUserSubscriptions(lists)
    },
    setUserSubscriptions (lists) {
      this.userDataUpdated = false
      let requestBody = {
        'cognito_id': this.userData['user_data']['user_id'],
        'email': this.userData['user_data']['email_address'],
        'character_set_preference': this.userData['user_data']['character_set_preference'],
        'lists': lists
      }
      console.log(requestBody)
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
                this.userDataUpdated = true
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
.dropdown-open {
  display: block;
}
.list-display{
    height: 350px;
    overflow-y: scroll;
    display: block;
}
</style>
