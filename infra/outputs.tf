output "instance_public_ip" {
  description = "IP publico da EC2 (use para acessar a API e configurar o secret EC2_HOST)"
  value       = aws_instance.this.public_ip
}

output "ssh_private_key_pem" {
  description = "Chave privada SSH gerada (use para configurar o secret EC2_SSH_PRIVATE_KEY). Nao versionar."
  value       = tls_private_key.this.private_key_pem
  sensitive   = true
}

output "ssh_command" {
  description = "Comando de exemplo para acessar a instancia via SSH"
  value       = "ssh -i <arquivo-com-a-chave-privada> ec2-user@${aws_instance.this.public_ip}"
}
