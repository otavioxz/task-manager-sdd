variable "aws_region" {
  description = "Regiao AWS onde a EC2 sera criada"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "Tipo da instancia EC2"
  type        = string
  default     = "t3.micro"
}

variable "ssh_allowed_cidr" {
  description = "CIDR (ex: SEU_IP/32) autorizado a acessar a porta 22. Nunca use 0.0.0.0/0."
  type        = string

  validation {
    condition     = var.ssh_allowed_cidr != "0.0.0.0/0"
    error_message = "ssh_allowed_cidr nao pode ser 0.0.0.0/0 (abriria SSH para a internet)."
  }
}

variable "project_name" {
  description = "Prefixo usado para nomear os recursos"
  type        = string
  default     = "task-manager"
}
