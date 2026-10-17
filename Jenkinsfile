pipeline {
    agent any

    stages {
        stage('Repository Hygiene') {
            steps {
                sh 'bash scripts/hygiene.sh'
            }
        }

        stage('Install') {
            steps {
                sh 'make install'
            }
        }

        stage('Test') {
            steps {
                sh 'make test'
            }
        }

        stage('Build') {
            steps {
                sh 'make build'
            }
        }
    }

    post {
        success {
            echo 'BILLBOOK pipeline completed successfully!'
        }
        failure {
            echo 'BILLBOOK pipeline failed. Check the stage logs.'
        }
    }
}
