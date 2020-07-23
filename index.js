const { ApolloServer, gql } = require('apollo-server');
const got = require('got');

const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  type Launch {
      flightNumber: String
      rocketName: String
      siteName: String
      launchDate: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    launchesByRocketName(rocketName:String) : [Launch]
  }
`;

const baseUrl = "api.spacexdata.com/v3"
const spaceXStore = {

    async getLaunchesByRocketName(rocketName) {

        const target = `https://${baseUrl}/launches?rocket_name=${encodeURIComponent(rocketName)}`
        const results = await got(target, { method: 'GET' });

        console.log(target)

        if (!results) {
            return []
        }

        return results

    },
}

const resolvers = {
    Query: {
        launchesByRocketName: async (parent, args) => {

            const rocketName = args.rocketName;
            let flight;

            flight = await spaceXStore.getLaunchesByRocketName(rocketName)

            const flightBody = JSON.parse(flight.body)

            return flightBody.map((element) => {

                return {
                    flightNumber: element.flight_number,
                    rocketName: element.rocket ? element.rocket.rocket_name : "NA",
                    siteName: element.launch_site ? element.launch_site.site_name : "NA",
                    launchDate: element.launch_date_utc,

                }

            })

        }
    },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});