import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import JwtDecode from '../utils/jwt-decode';
import { UserInfo } from '../utils/userInfo';
import { UserSignUp } from '../utils/userSignUp';
import { HostService } from './host.service';
import { UserIdentityService } from './user-identity.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userInfo: UserInfo | any;

  constructor(
    private http: HttpClient,
    private jwtBreaker: JwtDecode,
    private hostAddress: HostService,
    private userIdentity: UserIdentityService,
  ) { }

  userSignUp(data: UserSignUp) {
    return new Promise<UserInfo>((resolve, reject) => {
      let obj = {
        name: data.name,
        email: data.email,
        password: data.password,
      }

      this.http.post(`${this.hostAddress.getHostIp()}/api/users`, obj, { responseType: "json" })
        .toPromise()
        .then((data: any) => {
          console.log(data)
          sessionStorage.setItem("token", data.payload);
          data = this.jwtBreaker.decodedToken(data.payload)
          this.userIdentity.changeUserIdentity(data.id)
          resolve(data);
        })
        .catch((error) => {
          console.log(error)
          reject(error)
        })
    })
  }

  userLogin(email: any, password: any) {
    return new Promise<UserInfo>((resolve, reject) => {
      let user = {
        email: email,
        password: password
      }

      this.http.post(`${this.hostAddress.getHostIp()}/api/users/login`, user, { responseType: "json" })
        .toPromise()
        .then((data: any) => {
          console.log(data)

          sessionStorage.setItem("token", data.payload)

          let user = this.jwtBreaker.decodedToken(data.payload)
          console.log(user.id);
          this.userIdentity.changeUserIdentity(user.id)

          resolve(user);
        })
        .catch((error) => {
          console.log(error)

          reject(error)
        })
    })
  }

  isLoggedIn(): boolean {
    if (sessionStorage.getItem("token")) {
      return true;
    }
    else return false;
  }
}