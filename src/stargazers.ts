import moment from 'moment'
import { context } from '@actions/github'
import { Util } from './util'
import { octokit } from './octokit'
import { Await, Config, Timespan } from './types'

export namespace Stargazers {
  export async function list() {
    const stargazers = await octokit.paginate(
      octokit.activity.listStargazersForRepo,
      {
        ...context.repo,
        per_page: 100,
      },
    )
    return stargazers
  }

  type StargazerList = Await<ReturnType<typeof list>>

  export function render(
    stargazerList: StargazerList = [],
    timespan: Timespan,
    config: Config,
  ) {
    const stargazers = stargazerList.filter(
      (item) =>
        item != null &&
        moment(item.starred_at).isBetween(
          timespan.fromDateString,
          timespan.toDateString,
        ),
    )

    const result: string[] = []
    result.push(
      renderTitle(timespan, config, stargazers),
      renderSummary(timespan, config, stargazers),
      stargazers
        .map((stargazer) => renderItem(timespan, config, stargazer, stargazers))
        .join('\n'),
    )

    return result.join('\n')
  }

  function renderTitle(
    timespan: Timespan,
    config: Config,
    stargazers: StargazerList,
  ) {
    return Util.render(
      config.templateStargazersTitle,
      timespan,
      {
        stargazers,
      },
      true,
    )
  }

  function renderSummary(
    timespan: Timespan,
    config: Config,
    stargazers: StargazerList,
  ) {
    return Util.render(
      config.templateStargazersSummary,
      timespan,
      {
        stargazers,
      },
      true,
    )
  }

  function renderItem(
    timespan: Timespan,
    config: Config,
    stargazer: StargazerList[0],
    stargazers: StargazerList,
  ) {
    return Util.render(
      config.templateStargazersItem,
      timespan,
      {
        stargazer,
        stargazers,
        userLink: `[${stargazer!.login}](${stargazer!.html_url})`,
      },
      true,
    )
  }
}
