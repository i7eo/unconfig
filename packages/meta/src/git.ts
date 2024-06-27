import { REPO_BRANCH, REPO_NAME, REPO_OWNER } from './repo'

/** git 信息 */
export const GIT_IP = 'github.com'
/** git 信息, IP + PORT */
export const GIT_HOST = 'github.com'
export const GIT_URL = `http://${GIT_HOST}/${REPO_OWNER}/${REPO_NAME}`
export const GIT_ORG_URL = `http://${GIT_HOST}/${REPO_OWNER}`
export const GIT_FILE_PATH = `tree/${REPO_BRANCH}`
export const GIT_FILE_URL = `${GIT_URL}/${GIT_FILE_PATH}`
export const GIT_BLOG_PATH = `blob/${REPO_BRANCH}`
export const GIT_BLOG_URL = `${GIT_URL}/${GIT_BLOG_PATH}`
export const GIT_DOCUMENT_PROJECT_URL = `${GIT_FILE_URL}/apps/document/:path`
