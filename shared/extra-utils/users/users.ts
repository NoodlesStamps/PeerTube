import * as request from 'supertest'
import { makeGetRequest, makePostBodyRequest, makePutBodyRequest, updateAvatarRequest } from '../requests/requests'

import { UserCreate, UserRole } from '../../index'
import { NSFWPolicyType } from '../../models/videos/nsfw-policy.type'
import { ServerInfo, userLogin } from '..'
import { UserAdminFlag } from '../../models/users/user-flag.model'
import { UserRegister } from '../../models/users/user-register.model'

type CreateUserArgs = { url: string,
  accessToken: string,
  username: string,
  password: string,
  videoQuota?: number,
  videoQuotaDaily?: number,
  role?: UserRole,
  adminFlags?: UserAdminFlag,
  specialStatus?: number
}
function createUser (parameters: CreateUserArgs) {
  const {
    url,
    accessToken,
    username,
    adminFlags,
    password = 'password',
    videoQuota = 1000000,
    videoQuotaDaily = -1,
    role = UserRole.USER,
    specialStatus = 200
  } = parameters

  const path = '/api/v1/users'
  const body = {
    username,
    password,
    role,
    adminFlags,
    email: username + '@example.com',
    videoQuota,
    videoQuotaDaily
  }

  return request(url)
          .post(path)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer ' + accessToken)
          .send(body)
          .expect(specialStatus)
}

async function generateUserAccessToken (server: ServerInfo, username: string) {
  const password = 'my super password'
  await createUser({ url: server.url, accessToken: server.accessToken, username: username, password: password })

  return userLogin(server, { username, password })
}

function registerUser (url: string, username: string, password: string, specialStatus = 204) {
  const path = '/api/v1/users/register'
  const body = {
    username,
    password,
    email: username + '@example.com'
  }

  return request(url)
          .post(path)
          .set('Accept', 'application/json')
          .send(body)
          .expect(specialStatus)
}

function registerUserWithChannel (options: {
  url: string,
  user: { username: string, password: string },
  channel: { name: string, displayName: string }
}) {
  const path = '/api/v1/users/register'
  const body: UserRegister = {
    username: options.user.username,
    password: options.user.password,
    email: options.user.username + '@example.com',
    channel: options.channel
  }

  return makePostBodyRequest({
    url: options.url,
    path,
    fields: body,
    statusCodeExpected: 204
  })
}

function getMyUserInformation (url: string, accessToken: string, specialStatus = 200) {
  const path = '/api/v1/users/me'

  return request(url)
          .get(path)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer ' + accessToken)
          .expect(specialStatus)
          .expect('Content-Type', /json/)
}

function deleteMe (url: string, accessToken: string, specialStatus = 204) {
  const path = '/api/v1/users/me'

  return request(url)
    .delete(path)
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + accessToken)
    .expect(specialStatus)
}

function getMyUserVideoQuotaUsed (url: string, accessToken: string, specialStatus = 200) {
  const path = '/api/v1/users/me/video-quota-used'

  return request(url)
          .get(path)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer ' + accessToken)
          .expect(specialStatus)
          .expect('Content-Type', /json/)
}

function getUserInformation (url: string, accessToken: string, userId: number) {
  const path = '/api/v1/users/' + userId

  return request(url)
    .get(path)
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + accessToken)
    .expect(200)
    .expect('Content-Type', /json/)
}

function getMyUserVideoRating (url: string, accessToken: string, videoId: number | string, specialStatus = 200) {
  const path = '/api/v1/users/me/videos/' + videoId + '/rating'

  return request(url)
          .get(path)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer ' + accessToken)
          .expect(specialStatus)
          .expect('Content-Type', /json/)
}

function getUsersList (url: string, accessToken: string) {
  const path = '/api/v1/users'

  return request(url)
          .get(path)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer ' + accessToken)
          .expect(200)
          .expect('Content-Type', /json/)
}

function getUsersListPaginationAndSort (url: string, accessToken: string, start: number, count: number, sort: string, search?: string) {
  const path = '/api/v1/users'

  return request(url)
          .get(path)
          .query({ start })
          .query({ count })
          .query({ sort })
          .query({ search })
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer ' + accessToken)
          .expect(200)
          .expect('Content-Type', /json/)
}

function removeUser (url: string, userId: number | string, accessToken: string, expectedStatus = 204) {
  const path = '/api/v1/users'

  return request(url)
          .delete(path + '/' + userId)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer ' + accessToken)
          .expect(expectedStatus)
}

function blockUser (url: string, userId: number | string, accessToken: string, expectedStatus = 204, reason?: string) {
  const path = '/api/v1/users'
  let body: any
  if (reason) body = { reason }

  return request(url)
    .post(path + '/' + userId + '/block')
    .send(body)
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + accessToken)
    .expect(expectedStatus)
}

function unblockUser (url: string, userId: number | string, accessToken: string, expectedStatus = 204) {
  const path = '/api/v1/users'

  return request(url)
    .post(path + '/' + userId + '/unblock')
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + accessToken)
    .expect(expectedStatus)
}

function updateMyUser (options: {
  url: string
  accessToken: string
  currentPassword?: string
  newPassword?: string
  nsfwPolicy?: NSFWPolicyType
  email?: string
  autoPlayVideo?: boolean
  displayName?: string
  description?: string
  videosHistoryEnabled?: boolean
}) {
  const path = '/api/v1/users/me'

  const toSend = {}
  if (options.currentPassword !== undefined && options.currentPassword !== null) toSend['currentPassword'] = options.currentPassword
  if (options.newPassword !== undefined && options.newPassword !== null) toSend['password'] = options.newPassword
  if (options.nsfwPolicy !== undefined && options.nsfwPolicy !== null) toSend['nsfwPolicy'] = options.nsfwPolicy
  if (options.autoPlayVideo !== undefined && options.autoPlayVideo !== null) toSend['autoPlayVideo'] = options.autoPlayVideo
  if (options.email !== undefined && options.email !== null) toSend['email'] = options.email
  if (options.description !== undefined && options.description !== null) toSend['description'] = options.description
  if (options.displayName !== undefined && options.displayName !== null) toSend['displayName'] = options.displayName
  if (options.videosHistoryEnabled !== undefined && options.videosHistoryEnabled !== null) {
    toSend['videosHistoryEnabled'] = options.videosHistoryEnabled
  }

  return makePutBodyRequest({
    url: options.url,
    path,
    token: options.accessToken,
    fields: toSend,
    statusCodeExpected: 204
  })
}

function updateMyAvatar (options: {
  url: string,
  accessToken: string,
  fixture: string
}) {
  const path = '/api/v1/users/me/avatar/pick'

  return updateAvatarRequest(Object.assign(options, { path }))
}

function updateUser (options: {
  url: string
  userId: number,
  accessToken: string,
  email?: string,
  emailVerified?: boolean,
  videoQuota?: number,
  videoQuotaDaily?: number,
  password?: string,
  adminFlags?: UserAdminFlag,
  role?: UserRole
}) {
  const path = '/api/v1/users/' + options.userId

  const toSend = {}
  if (options.password !== undefined && options.password !== null) toSend['password'] = options.password
  if (options.email !== undefined && options.email !== null) toSend['email'] = options.email
  if (options.emailVerified !== undefined && options.emailVerified !== null) toSend['emailVerified'] = options.emailVerified
  if (options.videoQuota !== undefined && options.videoQuota !== null) toSend['videoQuota'] = options.videoQuota
  if (options.videoQuotaDaily !== undefined && options.videoQuotaDaily !== null) toSend['videoQuotaDaily'] = options.videoQuotaDaily
  if (options.role !== undefined && options.role !== null) toSend['role'] = options.role
  if (options.adminFlags !== undefined && options.adminFlags !== null) toSend['adminFlags'] = options.adminFlags

  return makePutBodyRequest({
    url: options.url,
    path,
    token: options.accessToken,
    fields: toSend,
    statusCodeExpected: 204
  })
}

function askResetPassword (url: string, email: string) {
  const path = '/api/v1/users/ask-reset-password'

  return makePostBodyRequest({
    url,
    path,
    fields: { email },
    statusCodeExpected: 204
  })
}

function resetPassword (url: string, userId: number, verificationString: string, password: string, statusCodeExpected = 204) {
  const path = '/api/v1/users/' + userId + '/reset-password'

  return makePostBodyRequest({
    url,
    path,
    fields: { password, verificationString },
    statusCodeExpected
  })
}

function askSendVerifyEmail (url: string, email: string) {
  const path = '/api/v1/users/ask-send-verify-email'

  return makePostBodyRequest({
    url,
    path,
    fields: { email },
    statusCodeExpected: 204
  })
}

function verifyEmail (url: string, userId: number, verificationString: string, statusCodeExpected = 204) {
  const path = '/api/v1/users/' + userId + '/verify-email'

  return makePostBodyRequest({
    url,
    path,
    fields: { verificationString },
    statusCodeExpected
  })
}

// ---------------------------------------------------------------------------

export {
  createUser,
  registerUser,
  getMyUserInformation,
  getMyUserVideoRating,
  deleteMe,
  registerUserWithChannel,
  getMyUserVideoQuotaUsed,
  getUsersList,
  getUsersListPaginationAndSort,
  removeUser,
  updateUser,
  updateMyUser,
  getUserInformation,
  blockUser,
  unblockUser,
  askResetPassword,
  resetPassword,
  updateMyAvatar,
  askSendVerifyEmail,
  generateUserAccessToken,
  verifyEmail
}
