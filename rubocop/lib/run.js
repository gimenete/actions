const { execSync } = require('child_process')
const request = require('./request')

const { GITHUB_SHA, GITHUB_EVENT_PATH, GITHUB_TOKEN } = process.env
const event = require(GITHUB_EVENT_PATH)
const { repository } = event
const {
  owner: { login: owner }
} = repository
const { name: repo } = repository

const checkName = 'ESLint check'

const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/vnd.github.antiope-preview+json',
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  'User-Agent': 'eslint-action'
}

async function createCheck() {
  const body = {
    name: checkName,
    head_sha: GITHUB_SHA,
    status: 'in_progress',
    started_at: new Date()
  }

  const { data } = await request(`https://api.github.com/repos/${owner}/${repo}/check-runs`, {
    method: 'POST',
    headers,
    body
  })
  const { id } = data
  return id
}

function rubocop() {
  const result = spawnSync('rubocop', ['--format', 'json'])

  const { status, output } = result
  const [, stderr] = output
  const report = JSON.parse(stderr)

  const annotationLevels = {
    refactor: 'failure',
    convention: 'failure',
    warning: 'warning',
    error: 'failure',
    fatal: 'failure'
  }

  const { files, summary } = report

  const annotations = []
  for (const file of files) {
    const { path, offenses } = file
    for (const offense of offenses) {
      const { severity, message, location } = offense
      const { start_line, last_line: end_line } = location

      annotations.push({
        path,
        start_line,
        end_line,
        annotation_level: annotationLevels[severity],
        message
      })
    }
  }

  return {
    conclusion: status > 0 ? 'failure' : 'success',
    output: {
      title: checkName,
      summary: `${summary.offense_count} offense(s) found`,
      annotations
    }
  }
}

async function updateCheck(id, conclusion, output) {
  const body = {
    name: checkName,
    head_sha: GITHUB_SHA,
    status: 'completed',
    completed_at: new Date(),
    conclusion,
    output
  }

  await request(`https://api.github.com/repos/${owner}/${repo}/check-runs/${id}`, {
    method: 'PATCH',
    headers,
    body
  })
}

function exitWithError(err) {
  console.error('Error', err.stack)
  if (err.data) {
    console.error(err.data)
  }
  process.exit(1)
}

async function run() {
  const id = await createCheck()
  try {
    const { conclusion, output } = rubocop()
    console.log(output.summary)
    await updateCheck(id, conclusion, output)
    if (conclusion === 'failure') {
      process.exit(78)
    }
  } catch (err) {
    await updateCheck(id, 'failure')
    exitWithError(err)
  }
}

run().catch(exitWithError)
