variable "product" {
    type    = "string"
    default = "em"
    description           = "The name of your application"
}


variable "location" {
    type                  = "string"
    default               = "UK South"
}

variable "env" {
    type                  = "string"
    description           = "(Required) The environment in which to deploy the application infrastructure."
}

variable "ilbIp" {}

/* variable "tenant_id" {
  type                  = "string"
  description           = "(Required) The Azure Active Directory tenant ID that should be used for authenticating requests to the key vault. This is usually sourced from environemnt variables and not normally required to be specified."
}
variable "object_id" {
  type                  = "string"
  description           = "(Required) The object ID of a user, service principal or security group in the Azure Active Directory tenant for the vault. The object ID must be unique for the list of access policies. This is usually sourced from environemnt variables and not normally required to be specified."
} */

variable "subscription" {}
