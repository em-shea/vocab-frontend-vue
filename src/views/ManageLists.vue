<template>
  <div id="manage-lists">
    <small-header></small-header>
    <div class="container">
        <div class="row">
            <div class="col-7">
                <h5>
                    My subscriptions
                </h5>
            </div>
            <div class="col-5">
                <button type="button" class="btn btn-secondary" v-if="!changesMade">Submit</button>
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
                                <button type="button" class="btn btn-outline-danger" :class="{ 'btn-outline-danger': unsubSelected, 'button-danger': !unsubSelected }" :click="toggleSelect(value['list_id'])">Unsubscribe</button>
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
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Filter
                    </button>
                    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        <a class="dropdown-item" href="#">Simplified</a>
                        <a class="dropdown-item" href="#">Traditional</a>
                    </div>
                </div>
            </div>
        </div>
        <div class="row bg-light">
            <div class="col-12 list-display">
                <div class="card shadow-sm text-center" v-for="(value, key) in allLists" :key=key>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-6">
                                <h6 class="card-text">{{ value['list_name'] }}</h6>
                                <p class="card-text">{{ value['character_set'] }}</p>
                            </div>
                            <div class="col-6">
                                <button type="button" class="btn btn-outline-success">Subscribe</button>
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
      dropdownOpen: false,
      unsubSelected: false,
      changesMade: false,
      userData: {},
      allLists: [
        {
          'list_name': 'HSK Level 1',
          'list_id': '12345',
          'character_set': 'simplified',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 2',
          'list_id': '23456',
          'character_set': 'simplified',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 3',
          'list_id': '34567',
          'character_set': 'simplified',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 4',
          'list_id': '4567',
          'character_set': 'simplified',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 1',
          'list_id': '5678',
          'character_set': 'traditional',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 2',
          'list_id': '6789',
          'character_set': 'traditional',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 3',
          'list_id': '9876',
          'character_set': 'traditional',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        },
        {
          'list_name': 'HSK Level 4',
          'list_id': '8765',
          'character_set': 'traditional',
          'date_created': '2021-06-16T23:06:48.467526',
          'created_by': 'admin'
        }
      ]
    }
  },
  mounted () {
    this.setListStatus()
    this.getUserData()
  },
  computed: {},
  methods: {
    setListStatus () {

    },
    toggleSelect (listId) {

    },
    getUserData () {
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
              .get(process.env.VUE_APP_API_URL + 'user_data', {
                headers: {
                  'Authorization': session.getIdToken().getJwtToken()
                }
              }
              )
              .then((response) => {
                console.log(response.data)
                this.userData = response.data
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
.list-display{
    height: 350px;
    overflow-y: scroll;
    display: block;
}
</style>
