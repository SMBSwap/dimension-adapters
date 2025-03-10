const { request, gql } = require("graphql-request");
import { SimpleAdapter } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";
import customBackfill, { IGraphs } from "../../helpers/customBackfill";
import { getChainVolume } from "../../helpers/getUniSubgraphVolume";

const blocksGraph = "https://testeborabora.cyou/subgraphs/name/blocks";
const blockQuery = gql`
  query blocks($timestampFrom: Int!, $timestampTo: Int!) {
    blocks(
      first: 1
      orderBy: timestamp
      orderDirection: asc
      where: { timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo }
    ) {
      id
      number
      timestamp
      __typename
    }
  }
`;


const getCustomBlock = async (timestamp: number) => {
  const block = Number(
    (
      await request(blocksGraph, blockQuery, {
        timestampFrom: timestamp - 30,
        timestampTo: timestamp + 30,
      })
    ).blocks[0].number
  );
  return block;
};

const endpoints = {
  [CHAIN.VELAS]: "https://testeborabora.cyou/subgraphs/name/wavelength22"
}
const graphs = getChainVolume({
  graphUrls: endpoints,
  totalVolume: {
    factory: "balancers",
    field: "totalSwapVolume",
  },
  hasDailyVolume: false,
  getCustomBlock,
});

const adapter: SimpleAdapter = {
  adapter: {
    [CHAIN.VELAS]: {
      fetch: graphs(CHAIN.VELAS),
      start: async () => 1666263553,
      customBackfill: customBackfill(CHAIN.VELAS, graphs as unknown as IGraphs)
    },
  },
};

export default adapter;
